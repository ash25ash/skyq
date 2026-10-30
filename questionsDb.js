const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const crypto = require('node:crypto');
const config = require('../config');

let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(config.DB_PATHS.questions);
  }
  return db;
}

function init() {
  const database = getDb();
  if (fs.existsSync(config.SQL_PATHS.questions)) {
    const schemaSql = fs.readFileSync(config.SQL_PATHS.questions, 'utf-8');
    database.exec(schemaSql);
  }
  return database;
}

// Fisher-Yates array shuffle helper
function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Returns 10 randomized questions with shuffled choices for a quiz attempt.
 * Also generates a secure verification token containing the answer map so the backend
 * can strictly verify answers without trusting client-side claims.
 */
function getRandomQuiz(count = 10, lang = 'en') {
  const database = getDb();
  const allQuestions = database.prepare('SELECT * FROM questions WHERE is_active = 1').all();

  if (allQuestions.length === 0) {
    throw new Error('No active questions found in questions database');
  }

  // Shuffle all questions and pick 10
  const shuffledQuestions = shuffle(allQuestions).slice(0, Math.min(count, allQuestions.length));

  const clientQuestions = [];
  const answerVerificationMap = {};

  shuffledQuestions.forEach((q, index) => {
    // Original choices
    const rawChoices = [
      { key: 'A', text_en: q.option_a_en, text_ro: q.option_a_ro },
      { key: 'B', text_en: q.option_b_en, text_ro: q.option_b_ro },
      { key: 'C', text_en: q.option_c_en, text_ro: q.option_c_ro },
      { key: 'D', text_en: q.option_d_en, text_ro: q.option_d_ro }
    ];

    // Shuffle the choices randomly
    const shuffledChoices = shuffle(rawChoices);

    // Give each shuffled choice a randomized client choice ID (e.g., c1, c2, c3, c4)
    const optionsForClient = shuffledChoices.map((choice, cIndex) => {
      const choiceId = `opt_${cIndex + 1}`;
      if (choice.key === q.correct_option) {
        // This is the correct choice
        answerVerificationMap[q.code] = choiceId;
      }
      return {
        id: choiceId,
        text_en: choice.text_en,
        text_ro: choice.text_ro,
        text: lang === 'ro' ? choice.text_ro : choice.text_en
      };
    });

    clientQuestions.push({
      index: index + 1,
      code: q.code,
      question_en: q.question_en,
      question_ro: q.question_ro,
      question: lang === 'ro' ? q.question_ro : q.question_en,
      category: q.category,
      options: optionsForClient
    });
  });

  // Create a signed HMAC token for the verification map
  const secret = 'skyq_secure_quiz_salt_' + (process.env.SESSION_SECRET || 'flight2026');
  const payload = JSON.stringify({
    map: answerVerificationMap,
    created: Date.now()
  });
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  const quizToken = Buffer.from(JSON.stringify({ payload, signature })).toString('base64');

  return {
    questions: clientQuestions,
    quizToken
  };
}

/**
 * Validates submitted answers against quiz token and database
 */
function verifyQuizSubmission(quizToken, userAnswers) {
  const secret = 'skyq_secure_quiz_salt_' + (process.env.SESSION_SECRET || 'flight2026');
  
  let map = null;
  try {
    const decoded = JSON.parse(Buffer.from(quizToken, 'base64').toString('utf-8'));
    const expectedSig = crypto.createHmac('sha256', secret).update(decoded.payload).digest('hex');
    if (expectedSig !== decoded.signature) {
      throw new Error('Invalid quiz token signature');
    }
    const data = JSON.parse(decoded.payload);
    map = data.map;
  } catch (err) {
    throw new Error('Tampered or invalid quiz session: ' + err.message);
  }

  const database = getDb();
  let correctCount = 0;
  const total = Object.keys(map).length;
  const breakdown = [];

  for (const [code, correctChoiceId] of Object.entries(map)) {
    const userSelected = userAnswers[code];
    const isCorrect = userSelected === correctChoiceId;
    if (isCorrect) correctCount++;

    const q = database.prepare('SELECT * FROM questions WHERE code = ?').get(code);

    breakdown.push({
      code,
      question_en: q ? q.question_en : '',
      question_ro: q ? q.question_ro : '',
      explanation_en: q ? q.explanation_en : '',
      explanation_ro: q ? q.explanation_ro : '',
      userSelected,
      isCorrect
    });
  }

  const isPerfect = correctCount === total;
  const scorePercent = Math.round((correctCount / total) * 100);

  return {
    correctCount,
    total,
    scorePercent,
    isPerfect,
    breakdown
  };
}

function getAllQuestions() {
  const database = getDb();
  return database.prepare('SELECT * FROM questions ORDER BY id ASC').all();
}

module.exports = {
  getDb,
  init,
  getRandomQuiz,
  verifyQuizSubmission,
  getAllQuestions
};
