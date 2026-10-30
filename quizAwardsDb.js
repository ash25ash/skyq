const { DatabaseSync } = require('node:sqlite');
const fs = require('node:fs');
const crypto = require('node:crypto');
const config = require('../config');

let db = null;

function getDb() {
  if (!db) {
    db = new DatabaseSync(config.DB_PATHS.quizAwards);
  }
  return db;
}

function init() {
  const database = getDb();
  if (fs.existsSync(config.SQL_PATHS.quizAwards)) {
    const schemaSql = fs.readFileSync(config.SQL_PATHS.quizAwards, 'utf-8');
    database.exec(schemaSql);
  }
  return database;
}

function saveSubmission({ clientUuid, totalQuestions, correctCount, scorePercent, isPerfect, answersJson }) {
  const database = getDb();
  const now = new Date().toISOString();

  const stmt = database.prepare(`
    INSERT INTO quiz_submissions (
      client_uuid, total_questions, correct_count, score_percent, is_perfect, answers_json, submitted_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const result = stmt.run(
    clientUuid,
    totalQuestions,
    correctCount,
    scorePercent,
    isPerfect ? 1 : 0,
    typeof answersJson === 'string' ? answersJson : JSON.stringify(answersJson),
    now
  );

  return {
    id: result.lastInsertRowid,
    clientUuid,
    correctCount,
    totalQuestions,
    isPerfect: Boolean(isPerfect),
    submittedAt: now
  };
}

function getPrizesCatalog() {
  const database = getDb();
  return database.prepare('SELECT * FROM prizes_catalog ORDER BY probability_weight DESC').all();
}

function getPrizeById(prizeId) {
  const database = getDb();
  return database.prepare('SELECT * FROM prizes_catalog WHERE id = ?').get(prizeId);
}

function awardPrize({
  clientUuid,
  submissionId,
  prizeId,
  emailRecipient,
  emailSubject,
  emailBodyHtml,
  language = 'en'
}) {
  const database = getDb();
  const prize = getPrizeById(prizeId);
  if (!prize) {
    throw new Error(`Prize not found: ${prizeId}`);
  }

  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const claimCode = `SKYQ-GIFT-${randomSuffix}`;
  const now = new Date().toISOString();

  const stmt = database.prepare(`
    INSERT INTO client_awards (
      client_uuid, submission_id, prize_id, prize_title_en, prize_title_ro,
      prize_description_en, prize_description_ro, pickup_location_en, pickup_location_ro,
      claim_code, email_recipient, email_status, email_sent_at, email_subject, email_body_html, won_at
    ) VALUES (
      ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    )
  `);

  const result = stmt.run(
    clientUuid,
    submissionId,
    prize.id,
    prize.title_en,
    prize.title_ro,
    prize.description_en,
    prize.description_ro,
    prize.pickup_location_en,
    prize.pickup_location_ro,
    claimCode,
    emailRecipient,
    'SENT',
    now,
    emailSubject,
    emailBodyHtml,
    now
  );

  return {
    id: result.lastInsertRowid,
    clientUuid,
    claimCode,
    prize: {
      id: prize.id,
      title_en: prize.title_en,
      title_ro: prize.title_ro,
      description_en: prize.description_en,
      description_ro: prize.description_ro,
      pickup_location_en: prize.pickup_location_en,
      pickup_location_ro: prize.pickup_location_ro,
      title: language === 'ro' ? prize.title_ro : prize.title_en,
      description: language === 'ro' ? prize.description_ro : prize.description_en,
      pickupLocation: language === 'ro' ? prize.pickup_location_ro : prize.pickup_location_en
    },
    wonAt: now
  };
}

function getAwardsByClient(clientUuid) {
  const database = getDb();
  return database.prepare('SELECT * FROM client_awards WHERE client_uuid = ? ORDER BY id DESC').all(clientUuid);
}

function getAllAwards(limit = 100) {
  const database = getDb();
  return database.prepare('SELECT * FROM client_awards ORDER BY id DESC LIMIT ?').all(limit);
}

function getAllSubmissions(limit = 100) {
  const database = getDb();
  return database.prepare('SELECT * FROM quiz_submissions ORDER BY id DESC LIMIT ?').all(limit);
}

module.exports = {
  getDb,
  init,
  saveSubmission,
  getPrizesCatalog,
  getPrizeById,
  awardPrize,
  getAwardsByClient,
  getAllAwards,
  getAllSubmissions
};
