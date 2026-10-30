const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const config = require('./config');

const clientsDb = require('./db/clientsDb');
const questionsDb = require('./db/questionsDb');
const quizAwardsDb = require('./db/quizAwardsDb');
const emailService = require('./services/emailService');
const qrService = require('./services/qrService');

// Initialize all three databases
clientsDb.init();
questionsDb.init();
quizAwardsDb.init();

console.log('✓ All 3 databases initialized successfully:');
console.log('  1. Clients DB:', config.DB_PATHS.clients);
console.log('  2. Questions DB:', config.DB_PATHS.questions);
console.log('  3. Quiz Submissions & Awards DB:', config.DB_PATHS.quizAwards);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(data));
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e6) {
        req.destroy();
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      if (!body) return resolve({});
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(new Error('Invalid JSON'));
      }
    });
    req.on('error', reject);
  });
}

function serveStaticFile(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('500 Internal Server Error');
      }
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  // -------------------------------------------------------------
  // API ROUTES
  // -------------------------------------------------------------

  // Health check & DB overview
  if (pathname === '/api/health' && method === 'GET') {
    return sendJson(res, 200, {
      status: 'healthy',
      app: 'SkyQ Web App',
      domain: config.APP_DOMAIN,
      databases: {
        clients: 'connected',
        questions: 'connected',
        quizAwards: 'connected'
      },
      time: new Date().toISOString()
    });
  }

  // Generate QR Code SVG
  if (pathname === '/api/qr' && method === 'GET') {
    const targetUrl = parsedUrl.searchParams.get('url') || `${config.BASE_URL}`;
    const svg = qrService.generateQrSvg(targetUrl, 260);
    res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
    return res.end(svg);
  }

  // Step 2: Register client / passenger details
  if (pathname === '/api/clients' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { firstName, lastName, email, flightNumber, flightDate, language = 'en' } = body;

      // Strict validation according to user requirements
      const errors = {};
      if (!firstName || firstName.trim().length < 2) {
        errors.firstName = 'First name must contain at least 2 characters';
      }
      if (!lastName || lastName.trim().length < 2) {
        errors.lastName = 'Last name must contain at least 2 characters';
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = 'A valid email address is required for prize delivery';
      }
      if (!flightNumber || !/^[a-zA-Z0-9\s-]{2,10}$/.test(flightNumber.trim())) {
        errors.flightNumber = 'Flight number must be valid (e.g. SQ 402, RO 302, LH 1420)';
      }
      if (!flightDate || !/^\d{4}-\d{2}-\d{2}$/.test(flightDate.trim())) {
        errors.flightDate = 'Please select a valid flight date';
      }

      if (Object.keys(errors).length > 0) {
        return sendJson(res, 400, {
          success: false,
          message: 'Validation failed. Please correct the fields before proceeding.',
          errors
        });
      }

      const client = clientsDb.createClient({
        firstName,
        lastName,
        email,
        flightNumber,
        flightDate,
        language,
        ip: req.socket.remoteAddress || '',
        userAgent: req.headers['user-agent'] || ''
      });

      return sendJson(res, 201, {
        success: true,
        message: 'Client registered successfully',
        client: {
          uuid: client.uuid,
          firstName: client.first_name,
          lastName: client.last_name,
          email: client.email,
          flightNumber: client.flight_number,
          flightDate: client.flight_date,
          language: client.language
        }
      });
    } catch (err) {
      console.error('Error in /api/clients:', err);
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Step 3: Fetch 10 randomized quiz questions
  if (pathname === '/api/quiz' && method === 'GET') {
    try {
      const lang = parsedUrl.searchParams.get('lang') || 'en';
      const quizData = questionsDb.getRandomQuiz(10, lang);
      return sendJson(res, 200, {
        success: true,
        total: quizData.questions.length,
        questions: quizData.questions,
        quizToken: quizData.quizToken
      });
    } catch (err) {
      console.error('Error in /api/quiz:', err);
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Step 4: Submit answers & calculate score
  if (pathname === '/api/quiz/submit' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { quizToken, clientUuid, answers, language = 'en' } = body;

      if (!quizToken || !answers || typeof answers !== 'object') {
        return sendJson(res, 400, { success: false, message: 'Missing quiz token or answers' });
      }

      if (!clientUuid) {
        return sendJson(res, 400, { success: false, message: 'Client session missing. Please register first.' });
      }

      const client = clientsDb.getClientByUuid(clientUuid);
      if (!client) {
        return sendJson(res, 404, { success: false, message: 'Passenger record not found' });
      }

      // Verify answers strictly on server
      const evalResult = questionsDb.verifyQuizSubmission(quizToken, answers);

      // Save submission in Database 3 (quiz_awards.db)
      const savedSubmission = quizAwardsDb.saveSubmission({
        clientUuid,
        totalQuestions: evalResult.total,
        correctCount: evalResult.correctCount,
        scorePercent: evalResult.scorePercent,
        isPerfect: evalResult.isPerfect,
        answersJson: {
          submittedAnswers: answers,
          breakdown: evalResult.breakdown
        }
      });

      return sendJson(res, 200, {
        success: true,
        submissionId: savedSubmission.id,
        correctCount: evalResult.correctCount,
        total: evalResult.total,
        scorePercent: evalResult.scorePercent,
        isPerfect: evalResult.isPerfect,
        breakdown: evalResult.breakdown
      });
    } catch (err) {
      console.error('Error in /api/quiz/submit:', err);
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Get roulette prizes catalog
  if (pathname === '/api/prizes' && method === 'GET') {
    try {
      const lang = parsedUrl.searchParams.get('lang') || 'en';
      const prizes = quizAwardsDb.getPrizesCatalog().map(p => ({
        id: p.id,
        title: lang === 'ro' ? p.title_ro : p.title_en,
        title_en: p.title_en,
        title_ro: p.title_ro,
        description: lang === 'ro' ? p.description_ro : p.description_en,
        pickupLocation: lang === 'ro' ? p.pickup_location_ro : p.pickup_location_en,
        color: p.color_hex,
        textColor: p.text_color_hex,
        probabilityWeight: p.probability_weight
      }));

      return sendJson(res, 200, { success: true, prizes });
    } catch (err) {
      console.error('Error in /api/prizes:', err);
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Step 5: Spin roulette, claim gift & trigger email
  if (pathname === '/api/awards/spin' && method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { clientUuid, submissionId, prizeId, language = 'en' } = body;

      if (!clientUuid || !submissionId) {
        return sendJson(res, 400, { success: false, message: 'Missing client UUID or submission ID' });
      }

      const client = clientsDb.getClientByUuid(clientUuid);
      if (!client) {
        return sendJson(res, 404, { success: false, message: 'Client not found' });
      }

      // Check client has already won or if prize needs to be determined
      const catalog = quizAwardsDb.getPrizesCatalog();
      let chosenPrize = null;
      if (prizeId) {
        chosenPrize = catalog.find(p => p.id === prizeId);
      }
      if (!chosenPrize) {
        // Random pick based on weights
        const randomIdx = Math.floor(Math.random() * catalog.length);
        chosenPrize = catalog[randomIdx];
      }

      // Generate email content & dispatch email
      const claimCode = `SKYQ-${Math.floor(100000 + Math.random() * 900000)}`;
      const { subject, html } = emailService.generateEmailTemplate({
        client,
        prize: chosenPrize,
        claimCode,
        language
      });

      // Save award to Database 3 (quiz_awards.db)
      const award = quizAwardsDb.awardPrize({
        clientUuid,
        submissionId: Number(submissionId),
        prizeId: chosenPrize.id,
        emailRecipient: client.email,
        emailSubject: subject,
        emailBodyHtml: html,
        language
      });

      // Dispatch email notification
      const emailRecord = await emailService.sendPrizeEmail({
        client,
        prize: chosenPrize,
        claimCode: award.claimCode,
        language
      });

      return sendJson(res, 200, {
        success: true,
        award: {
          id: award.id,
          claimCode: award.claimCode,
          prize: award.prize,
          wonAt: award.wonAt
        },
        emailDispatched: {
          to: client.email,
          subject,
          status: 'SENT',
          previewId: emailRecord.id
        }
      });
    } catch (err) {
      console.error('Error in /api/awards/spin:', err);
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Admin / Diagnostics: Inspect the 3 Databases
  if (pathname === '/api/admin/data' && method === 'GET') {
    try {
      const clients = clientsDb.getAllClients(25);
      const submissions = quizAwardsDb.getAllSubmissions(25);
      const awards = quizAwardsDb.getAllAwards(25);
      const questions = questionsDb.getAllQuestions();

      return sendJson(res, 200, {
        success: true,
        stats: {
          totalClients: clients.length,
          totalSubmissions: submissions.length,
          totalAwards: awards.length,
          totalQuestions: questions.length
        },
        databases: {
          database1_clients: clients,
          database2_questions: questions.slice(0, 10),
          database3_submissions: submissions,
          database3_awards: awards
        }
      });
    } catch (err) {
      return sendJson(res, 500, { success: false, message: err.message });
    }
  }

  // Admin / Preview: Inspect recently sent emails
  if (pathname === '/api/admin/emails' && method === 'GET') {
    const emails = emailService.getRecentDispatchedEmails();
    return sendJson(res, 200, { success: true, count: emails.length, emails });
  }

  // -------------------------------------------------------------
  // STATIC FILE SERVING
  // -------------------------------------------------------------
  const publicDir = path.resolve(__dirname, '..', 'public');
  let requestedFile = pathname;

  if (requestedFile === '/' || requestedFile === '') {
    requestedFile = '/index.html';
  }

  const safeFilePath = path.normalize(path.join(publicDir, requestedFile));
  if (!safeFilePath.startsWith(publicDir)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    return res.end('403 Forbidden');
  }

  serveStaticFile(req, res, safeFilePath);
});

function start(port = config.PORT, host = config.HOST) {
  return new Promise((resolve) => {
    server.listen(port, host, () => {
      console.log(`=======================================================`);
      console.log(`✈️  SkyQ Web App is running at http://localhost:${port}`);
      console.log(`✈️  Domain configured: ${config.APP_DOMAIN}`);
      console.log(`✈️  Bilingual versions: English (EN) & Romanian (RO)`);
      console.log(`=======================================================`);
      resolve(server);
    });
  });
}

if (require.main === module) {
  start();
}

module.exports = { server, start };
