/**
 * SkyQ Database Seeder Script
 * Pre-populates the 3 separate SQLite databases:
 * 1. data/clients.db
 * 2. data/questions.db
 * 3. data/quiz_awards.db
 */

const clientsDb = require('../src/db/clientsDb');
const questionsDb = require('../src/db/questionsDb');
const quizAwardsDb = require('../src/db/quizAwardsDb');

console.log('Initializing and seeding SkyQ databases...');

try {
  const db1 = clientsDb.init();
  console.log('✓ Database 1 (clients.db) ready.');

  const db2 = questionsDb.init();
  const qCount = questionsDb.getAllQuestions().length;
  console.log(`✓ Database 2 (questions.db) ready with ${qCount} aviation questions.`);

  const db3 = quizAwardsDb.init();
  const pCount = quizAwardsDb.getPrizesCatalog().length;
  console.log(`✓ Database 3 (quiz_awards.db) ready with ${pCount} roulette prizes.`);

  console.log('All 3 databases are primed and ready for operation!');
} catch (err) {
  console.error('Error seeding databases:', err);
  process.exit(1);
}
