const assert = require('node:assert');
const { start } = require('../src/server');

async function runTests() {
  console.log('🚀 Starting SkyQ Web App End-to-End Test Suite...');
  const testPort = 3999;
  const server = await start(testPort, '127.0.0.1');

  const baseUrl = `http://127.0.0.1:${testPort}`;

  try {
    // Test 1: Health Check
    console.log('\n--- Test 1: Health Check ---');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(healthRes.status, 200);
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.status, 'healthy');
    assert.strictEqual(healthData.databases.clients, 'connected');
    assert.strictEqual(healthData.databases.questions, 'connected');
    assert.strictEqual(healthData.databases.quizAwards, 'connected');
    console.log('✓ Health check passed. All 3 databases connected!');

    // Test 2: QR Code Generation
    console.log('\n--- Test 2: QR Code SVG Generation ---');
    const qrRes = await fetch(`${baseUrl}/api/qr?url=https://SkyQ.com`);
    assert.strictEqual(qrRes.status, 200);
    const qrSvg = await qrRes.text();
    assert(qrSvg.includes('<svg'));
    assert(qrSvg.includes('SkyQ.com') || qrSvg.includes('viewBox'));
    console.log('✓ QR code SVG generated successfully (size:', qrSvg.length, 'bytes)');

    // Test 3: Form Validation (Failure case)
    console.log('\n--- Test 3: Passenger Validation (Invalid Data) ---');
    const invalidClientRes = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: '',
        lastName: '',
        email: 'invalid-email',
        flightNumber: '',
        flightDate: ''
      })
    });
    assert.strictEqual(invalidClientRes.status, 400);
    const invalidData = await invalidClientRes.json();
    assert.strictEqual(invalidData.success, false);
    assert(invalidData.errors.firstName);
    assert(invalidData.errors.lastName);
    assert(invalidData.errors.email);
    assert(invalidData.errors.flightNumber);
    assert(invalidData.errors.flightDate);
    console.log('✓ Form validation successfully blocked invalid passenger submission.');

    // Test 4: Passenger Registration (Success case)
    console.log('\n--- Test 4: Passenger Registration (Valid Data) ---');
    const clientRes = await fetch(`${baseUrl}/api/clients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: 'Alexander',
        lastName: 'Vancea',
        email: 'alexander.vancea@skyq-traveler.com',
        flightNumber: 'SQ 402',
        flightDate: '2026-11-15',
        language: 'ro'
      })
    });
    assert.strictEqual(clientRes.status, 201);
    const clientData = await clientRes.json();
    assert.strictEqual(clientData.success, true);
    assert(clientData.client.uuid);
    assert.strictEqual(clientData.client.firstName, 'Alexander');
    const clientUuid = clientData.client.uuid;
    console.log('✓ Passenger registered in Database 1 (clients.db) with UUID:', clientUuid);

    // Test 5: Fetch 10 Randomized Quiz Questions
    console.log('\n--- Test 5: Fetch 10 Randomized Questions ---');
    const quizRes = await fetch(`${baseUrl}/api/quiz?lang=en`);
    assert.strictEqual(quizRes.status, 200);
    const quizData = await quizRes.json();
    assert.strictEqual(quizData.success, true);
    assert.strictEqual(quizData.questions.length, 10);
    assert(quizData.quizToken);

    // Verify each question has 4 choices
    for (const q of quizData.questions) {
      assert.strictEqual(q.options.length, 4, `Question ${q.code} must have 4 choices`);
    }
    console.log('✓ Retrieved 10 randomized questions with 4 choices each and HMAC quizToken.');

    // Test 6: Submit Quiz Answers
    console.log('\n--- Test 6: Quiz Evaluation & Submission ---');
    // Decode token securely to simulate answering questions
    const decoded = JSON.parse(Buffer.from(quizData.quizToken, 'base64').toString('utf-8'));
    const tokenData = JSON.parse(decoded.payload);
    const correctMap = tokenData.map;

    const answers = {};
    for (const [code, correctChoiceId] of Object.entries(correctMap)) {
      answers[code] = correctChoiceId; // Select correct option for 10/10 perfect score
    }

    const submitRes = await fetch(`${baseUrl}/api/quiz/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizToken: quizData.quizToken,
        clientUuid,
        answers,
        language: 'en'
      })
    });
    assert.strictEqual(submitRes.status, 200);
    const submitResult = await submitRes.json();
    assert.strictEqual(submitResult.success, true);
    assert.strictEqual(submitResult.correctCount, 10);
    assert.strictEqual(submitResult.isPerfect, true);
    assert(submitResult.submissionId);
    console.log('✓ Quiz submitted and audited in Database 3 (quiz_awards.db)! Score: 10/10 Perfect Score!');

    // Test 7: Roulette Spin & Prize Claim
    console.log('\n--- Test 7: Lucky Roulette Spin & Prize Award ---');
    const spinRes = await fetch(`${baseUrl}/api/awards/spin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientUuid,
        submissionId: submitResult.submissionId,
        prizeId: 'PRZ_LOUNGE',
        language: 'en'
      })
    });
    assert.strictEqual(spinRes.status, 200);
    const spinData = await spinRes.json();
    assert.strictEqual(spinData.success, true);
    assert(spinData.award.claimCode.startsWith('SKYQ-'));
    assert.strictEqual(spinData.award.prize.id, 'PRZ_LOUNGE');
    assert(spinData.award.prize.pickup_location_en);
    assert.strictEqual(spinData.emailDispatched.status, 'SENT');
    console.log('✓ Prize awarded: VIP Lounge Pass | Claim Code:', spinData.award.claimCode);
    console.log('✓ Pickup Desk:', spinData.award.prize.pickup_location_en);

    // Test 8: Sent Emails Verification
    console.log('\n--- Test 8: Verify Dispatched Confirmation Email ---');
    const emailsRes = await fetch(`${baseUrl}/api/admin/emails`);
    assert.strictEqual(emailsRes.status, 200);
    const emailsData = await emailsRes.json();
    assert(emailsData.count >= 1);
    const lastEmail = emailsData.emails[0];
    assert.strictEqual(lastEmail.recipient, 'alexander.vancea@skyq-traveler.com');
    assert(lastEmail.subject.includes('Congratulations'));
    assert(lastEmail.html.includes(spinData.award.claimCode));
    assert(lastEmail.html.includes('Airport Terminal 1'));
    console.log('✓ Email dispatch confirmed to:', lastEmail.recipient);
    console.log('✓ Email contains voucher claim code and pickup instructions!');

    // Test 9: 3 Databases Live Inspector API
    console.log('\n--- Test 9: Inspect the 3 Databases ---');
    const dbRes = await fetch(`${baseUrl}/api/admin/data`);
    assert.strictEqual(dbRes.status, 200);
    const dbData = await dbRes.json();
    assert(dbData.databases.database1_clients.length >= 1);
    assert(dbData.databases.database2_questions.length >= 10);
    assert(dbData.databases.database3_submissions.length >= 1);
    assert(dbData.databases.database3_awards.length >= 1);
    console.log('✓ Verified 3 isolated databases via inspector:');
    console.log('  - Database 1 Clients count:', dbData.stats.totalClients);
    console.log('  - Database 2 Questions count:', dbData.stats.totalQuestions);
    console.log('  - Database 3 Submissions count:', dbData.stats.totalSubmissions);
    console.log('  - Database 3 Awards won count:', dbData.stats.totalAwards);

    console.log('\n🎉 ALL 9 TEST SUITES PASSED FLAWLESSLY! 🎉');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('\n❌ Test failed with error:', err);
  process.exit(1);
});
