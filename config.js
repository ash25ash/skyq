const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '..');

module.exports = {
  PORT: process.env.PORT || 3000,
  HOST: process.env.HOST || '0.0.0.0',
  APP_DOMAIN: process.env.APP_DOMAIN || 'SkyQ.com',
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  
  // Paths to the 3 separate databases
  DB_PATHS: {
    clients: path.join(ROOT_DIR, 'data', 'clients.db'),
    questions: path.join(ROOT_DIR, 'data', 'questions.db'),
    quizAwards: path.join(ROOT_DIR, 'data', 'quiz_awards.db')
  },

  // Path to SQL schemas
  SQL_PATHS: {
    clients: path.join(ROOT_DIR, 'sql', '01_clients.sql'),
    questions: path.join(ROOT_DIR, 'sql', '02_questions.sql'),
    quizAwards: path.join(ROOT_DIR, 'sql', '03_quiz_awards.sql')
  },

  // Email / SMTP settings
  EMAIL: {
    from: process.env.SMTP_FROM || 'SkyQ Rewards Team <concierge@skyq.com>',
    smtpHost: process.env.SMTP_HOST || '',
    smtpPort: process.env.SMTP_PORT || 587,
    smtpUser: process.env.SMTP_USER || '',
    smtpPass: process.env.SMTP_PASS || '',
    simulationMode: true // When true, stores sent emails in DB & memory for instant preview
  }
};
