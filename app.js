/**
 * SkyQ.com Single Page Web Application Controller
 */

// Application State
const state = {
  currentStep: 'welcome',
  client: null,
  quizToken: null,
  questions: [],
  userAnswers: {},
  quizResult: null,
  prizes: [],
  rouletteInstance: null,
  wonAward: null
};

document.addEventListener('DOMContentLoaded', () => {
  initLanguage();
  initEventListeners();
  initRoulette();
  loadQrCode();
});

// -------------------------------------------------------------
// 1. LANGUAGE CONTROLLER
// -------------------------------------------------------------
function initLanguage() {
  const savedLang = localStorage.getItem('skyq_lang') || 'en';
  setLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const lang = e.currentTarget.getAttribute('data-lang');
      setLanguage(lang);
      // Re-render questions if on quiz page so language updates seamlessly
      if (state.questions.length > 0 && state.currentStep === 'quiz') {
        renderQuestions();
      }
      if (state.prizes.length > 0 && state.rouletteInstance) {
        loadPrizes();
      }
    });
  });
}

// -------------------------------------------------------------
// 2. STEP ROUTER & NAVIGATION
// -------------------------------------------------------------
function goToStep(stepName) {
  state.currentStep = stepName;

  // Toggle active views
  document.querySelectorAll('.step-view').forEach(view => {
    view.classList.remove('active');
  });
  const targetView = document.getElementById(`step-${stepName}`);
  if (targetView) {
    targetView.classList.add('active');
  }

  // Update Stepper Bar
  const stepsOrder = ['welcome', 'form', 'quiz', 'results', 'roulette'];
  const currentIndex = stepsOrder.indexOf(stepName);

  document.querySelectorAll('.step-item').forEach(item => {
    const itemStep = item.getAttribute('data-step');
    const itemIndex = stepsOrder.indexOf(itemStep);

    item.classList.remove('active', 'completed');
    if (itemIndex === currentIndex) {
      item.classList.add('active');
    } else if (itemIndex < currentIndex) {
      item.classList.add('completed');
    }
  });

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// -------------------------------------------------------------
// 3. STEP 2: FORM SUBMISSION & VALIDATION
// -------------------------------------------------------------
function setupFormValidation() {
  const form = document.getElementById('passengerForm');
  const errBanner = document.getElementById('formBannerError');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errBanner.style.display = 'none';

    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const flightNumber = document.getElementById('inputFlightNumber').value.trim();
    const flightDate = document.getElementById('inputFlightDate').value.trim();

    let hasErrors = false;

    // Reset error states
    document.querySelectorAll('.form-input').forEach(i => i.classList.remove('is-invalid'));
    document.querySelectorAll('.input-error-msg').forEach(m => (m.textContent = ''));

    // First Name validation
    if (!firstName || firstName.length < 2) {
      document.getElementById('inputFirstName').classList.add('is-invalid');
      document.getElementById('errFirstName').textContent = getTranslation('errFirstName');
      hasErrors = true;
    }

    // Last Name validation
    if (!lastName || lastName.length < 2) {
      document.getElementById('inputLastName').classList.add('is-invalid');
      document.getElementById('errLastName').textContent = getTranslation('errLastName');
      hasErrors = true;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById('inputEmail').classList.add('is-invalid');
      document.getElementById('errEmail').textContent = getTranslation('errEmail');
      hasErrors = true;
    }

    // Flight Number validation
    const flightRegex = /^[a-zA-Z0-9\s-]{2,10}$/;
    if (!flightNumber || !flightRegex.test(flightNumber)) {
      document.getElementById('inputFlightNumber').classList.add('is-invalid');
      document.getElementById('errFlightNumber').textContent = getTranslation('errFlightNumber');
      hasErrors = true;
    }

    // Flight Date validation
    if (!flightDate) {
      document.getElementById('inputFlightDate').classList.add('is-invalid');
      document.getElementById('errFlightDate').textContent = getTranslation('errFlightDate');
      hasErrors = true;
    }

    if (hasErrors) {
      errBanner.textContent = getTranslation('errFormGeneral');
      errBanner.style.display = 'block';
      return;
    }

    // Submit client details to backend Database 1 (clients.db)
    try {
      const submitBtn = document.getElementById('btnSubmitForm');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Verifying Credentials...';

      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          flightNumber,
          flightDate,
          language: currentLang
        })
      });

      const data = await res.json();
      submitBtn.disabled = false;
      submitBtn.textContent = getTranslation('btnProceedToQuiz');

      if (!res.ok || !data.success) {
        errBanner.textContent = data.message || getTranslation('errFormGeneral');
        errBanner.style.display = 'block';
        return;
      }

      // Client verified successfully!
      state.client = data.client;

      // Update quiz header badges
      document.getElementById('badgePassengerName').textContent = `${state.client.firstName} ${state.client.lastName}`;
      document.getElementById('badgeFlightInfo').textContent = `${state.client.flightNumber} (${state.client.flightDate})`;

      // Fetch randomized 10 questions and advance to Quiz (Step 3)
      await fetchAndLoadQuiz();
      goToStep('quiz');

    } catch (err) {
      console.error('Registration error:', err);
      errBanner.textContent = 'Server connection error. Please try again.';
      errBanner.style.display = 'block';
      document.getElementById('btnSubmitForm').disabled = false;
    }
  });
}

// -------------------------------------------------------------
// 4. STEP 3: QUIZ CONTROLLER (THE WHITE RECTANGLE)
// -------------------------------------------------------------
async function fetchAndLoadQuiz() {
  const container = document.getElementById('questionsContainer');
  container.innerHTML = `<div style="text-align:center; padding: 40px; color: var(--color-dark-blue);">
    <div style="font-size: 32px; margin-bottom: 10px;">✈️</div>
    <strong>${getTranslation('quizLoading')}</strong>
  </div>`;

  try {
    const res = await fetch(`/api/quiz?lang=${currentLang}`);
    const data = await res.json();

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to load questions');
    }

    state.questions = data.questions;
    state.quizToken = data.quizToken;
    state.userAnswers = {};

    renderQuestions();
    updateQuizProgress();
  } catch (err) {
    console.error('Quiz fetch error:', err);
    container.innerHTML = `<div style="color:red; text-align:center;">Failed to load quiz. Please check server.</div>`;
  }
}

function renderQuestions() {
  const container = document.getElementById('questionsContainer');
  container.innerHTML = '';

  state.questions.forEach((q, qIndex) => {
    const questionCard = document.createElement('div');
    questionCard.className = 'question-block';
    questionCard.id = `q-block-${q.code}`;

    const questionText = currentLang === 'ro' ? q.question_ro : q.question_en;

    let optionsHtml = '';
    q.options.forEach(opt => {
      const optionText = currentLang === 'ro' ? opt.text_ro : opt.text_en;
      const isSelected = state.userAnswers[q.code] === opt.id;

      optionsHtml += `
        <label class="option-label ${isSelected ? 'is-selected' : ''}" data-code="${q.code}" data-opt-id="${opt.id}">
          <input type="radio" name="question_${q.code}" value="${opt.id}" class="option-radio" ${isSelected ? 'checked' : ''}>
          <span class="option-text">${optionText}</span>
        </label>
      `;
    });

    questionCard.innerHTML = `
      <div class="question-header">
        <div class="question-num-pill">${qIndex + 1}</div>
        <div class="question-text">${questionText}</div>
      </div>
      <div class="options-grid">
        ${optionsHtml}
      </div>
    `;

    container.appendChild(questionCard);
  });

  // Attach radio selection listeners
  container.querySelectorAll('.option-label').forEach(label => {
    label.addEventListener('click', (e) => {
      const code = label.getAttribute('data-code');
      const optId = label.getAttribute('data-opt-id');

      // Update state
      state.userAnswers[code] = optId;

      // Update UI for this question's labels
      const parentBlock = document.getElementById(`q-block-${code}`);
      parentBlock.classList.add('is-answered');
      parentBlock.querySelectorAll('.option-label').forEach(l => {
        l.classList.remove('is-selected');
        const radio = l.querySelector('input[type="radio"]');
        if (l.getAttribute('data-opt-id') === optId) {
          l.classList.add('is-selected');
          radio.checked = true;
        }
      });

      // Hide warning if visible
      document.getElementById('quizWarningText').style.display = 'none';
      updateQuizProgress();
    });
  });
}

function updateQuizProgress() {
  const total = state.questions.length;
  const answeredCount = Object.keys(state.userAnswers).length;
  const percent = total > 0 ? Math.round((answeredCount / total) * 100) : 0;

  document.getElementById('quizProgressText').textContent = `${answeredCount} / ${total} Answered`;
  document.getElementById('quizProgressFill').style.width = `${percent}%`;
}

async function submitQuiz() {
  const total = state.questions.length;
  const answeredCount = Object.keys(state.userAnswers).length;

  if (answeredCount < total) {
    const warning = document.getElementById('quizWarningText');
    warning.textContent = getTranslation('errQuizIncomplete', { count: total - answeredCount });
    warning.style.display = 'block';

    // Highlight the first unanswered question
    for (const q of state.questions) {
      if (!state.userAnswers[q.code]) {
        const el = document.getElementById(`q-block-${q.code}`);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.borderColor = '#ef4444';
        setTimeout(() => (el.style.borderColor = ''), 2000);
        break;
      }
    }
    return;
  }

  // Submit to backend
  try {
    const btn = document.getElementById('btnSubmitQuiz');
    btn.disabled = true;
    btn.textContent = 'Calculating score...';

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        quizToken: state.quizToken,
        clientUuid: state.client.uuid,
        answers: state.userAnswers,
        language: currentLang
      })
    });

    const data = await res.json();
    btn.disabled = false;
    btn.textContent = getTranslation('btnSubmitQuiz');

    if (!res.ok || !data.success) {
      alert(data.message || 'Error submitting quiz');
      return;
    }

    state.quizResult = data;
    renderResults();
    goToStep('results');

  } catch (err) {
    console.error('Quiz submit error:', err);
    alert('Server communication error. Please try again.');
    document.getElementById('btnSubmitQuiz').disabled = false;
  }
}

// -------------------------------------------------------------
// 5. STEP 4: RESULTS SCREEN
// -------------------------------------------------------------
function renderResults() {
  const res = state.quizResult;
  if (!res) return;

  const scoreNum = document.getElementById('resultsScoreNumber');
  const scoreCaption = document.getElementById('resultsScoreCaption');
  const bannerBadge = document.getElementById('resultsBannerBadge');
  const title = document.getElementById('resultsMessageTitle');
  const desc = document.getElementById('resultsMessageDesc');
  const btnRoulette = document.getElementById('btnGoToRoulette');
  const btnRetry = document.getElementById('btnRetryQuiz');

  scoreNum.textContent = `${res.correctCount} / ${res.total}`;
  scoreCaption.textContent = getTranslation('resultsScoreText', { correct: res.correctCount, total: res.total });

  if (res.isPerfect) {
    // 10 / 10 Perfect score!
    bannerBadge.textContent = '🏆';
    title.textContent = getTranslation('resultsPerfectTitle');
    desc.textContent = getTranslation('resultsPerfectDesc');
    btnRoulette.style.display = 'inline-flex';
    btnRetry.style.display = 'none';

    // Celebration confetti!
    if (window.confettiCannon) {
      window.confettiCannon.burst(100);
    }
  } else {
    // Not 10/10
    bannerBadge.textContent = '✈️';
    title.textContent = getTranslation('resultsFailTitle');
    desc.textContent = getTranslation('resultsFailDesc', { correct: res.correctCount });
    btnRoulette.style.display = 'none';
    btnRetry.style.display = 'inline-flex';
  }

  // Render question explanations breakdown
  const breakdownContainer = document.getElementById('breakdownList');
  breakdownContainer.innerHTML = '';

  res.breakdown.forEach((item, index) => {
    const div = document.createElement('div');
    div.className = `breakdown-item ${item.isCorrect ? 'correct' : 'incorrect'}`;

    const qText = currentLang === 'ro' ? item.question_ro : item.question_en;
    const expl = currentLang === 'ro' ? item.explanation_ro : item.explanation_en;

    div.innerHTML = `
      <div class="breakdown-title">
        <span>#${index + 1}: ${qText}</span>
        <span class="badge-tag ${item.isCorrect ? 'correct' : 'incorrect'}">
          ${item.isCorrect ? getTranslation('badgeCorrect') : getTranslation('badgeIncorrect')}
        </span>
      </div>
      <div class="breakdown-desc">💡 ${expl}</div>
    `;
    breakdownContainer.appendChild(div);
  });
}

// -------------------------------------------------------------
// 6. STEP 5: ROULETTE & PRIZE WIN CONTROLLER
// -------------------------------------------------------------
function initRoulette() {
  state.rouletteInstance = new SkyQRoulette('rouletteCanvas', onWheelPrizeLanded);
  loadPrizes();
}

async function loadPrizes() {
  try {
    const res = await fetch(`/api/prizes?lang=${currentLang}`);
    const data = await res.json();
    if (data.success) {
      state.prizes = data.prizes;
      if (state.rouletteInstance) {
        state.rouletteInstance.setPrizes(state.prizes);
      }
    }
  } catch (e) {
    console.error('Error loading prizes:', e);
  }
}

async function spinRoulette() {
  if (!state.client || !state.quizResult) {
    alert('Please complete the quiz first!');
    return;
  }

  const btn = document.getElementById('btnSpinRoulette');
  btn.disabled = true;

  // Pick winning prize via backend API
  try {
    const res = await fetch('/api/awards/spin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientUuid: state.client.uuid,
        submissionId: state.quizResult.submissionId,
        language: currentLang
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      alert(data.message || 'Error spinning roulette');
      btn.disabled = false;
      return;
    }

    state.wonAward = data.award;

    // Spin canvas wheel to match winning prize
    state.rouletteInstance.spin(data.award.prize.id);

  } catch (err) {
    console.error('Spin error:', err);
    btn.disabled = false;
  }
}

function onWheelPrizeLanded(prize) {
  const award = state.wonAward;
  const awardCard = document.getElementById('winnerAwardCard');

  const title = currentLang === 'ro' ? award.prize.title_ro : award.prize.title_en;
  const desc = currentLang === 'ro' ? award.prize.description_ro : award.prize.description_en;
  const pickup = currentLang === 'ro' ? award.prize.pickup_location_ro : award.prize.pickup_location_en;

  document.getElementById('winnerPrizeTitle').textContent = `🎁 ${title}`;
  document.getElementById('winnerPrizeDesc').textContent = desc;
  document.getElementById('winnerClaimCode').textContent = award.claimCode;
  document.getElementById('winnerPickupLoc').textContent = pickup;
  document.getElementById('winnerEmailRecipient').textContent = state.client.email;

  awardCard.style.display = 'block';
  awardCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// -------------------------------------------------------------
// 7. MODALS & INSPECTORS (QR CODE, 3 DATABASES, SENT EMAILS)
// -------------------------------------------------------------
function loadQrCode() {
  const img = document.getElementById('qrCodeImage');
  if (img) {
    const currentUrl = window.location.origin;
    img.src = `/api/qr?url=${encodeURIComponent(currentUrl)}`;
    const urlLabel = document.getElementById('qrModalUrl');
    if (urlLabel) urlLabel.textContent = `${currentUrl} (SkyQ.com)`;
  }
}

async function openDatabaseInspector() {
  const modal = document.getElementById('modalDatabaseViewer');
  modal.classList.add('open');

  try {
    const res = await fetch('/api/admin/data');
    const data = await res.json();

    if (data.success) {
      // 1. Clients DB
      const tbodyClients = document.getElementById('tbodyClients');
      tbodyClients.innerHTML = data.databases.database1_clients.map(c => `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td>${c.first_name} ${c.last_name}</td>
          <td>${c.email}</td>
          <td><span style="font-family:monospace;font-weight:700;">${c.flight_number}</span></td>
          <td>${c.flight_date}</td>
          <td>${new Date(c.created_at).toLocaleTimeString()}</td>
        </tr>
      `).join('') || '<tr><td colspan="6" style="text-align:center;">No client records yet</td></tr>';

      // 2. Questions DB
      const tbodyQuestions = document.getElementById('tbodyQuestions');
      tbodyQuestions.innerHTML = data.databases.database2_questions.map(q => `
        <tr>
          <td><strong>${q.code}</strong></td>
          <td>${q.question_en}</td>
          <td><span style="background:#dbeafe;padding:2px 8px;border-radius:4px;font-weight:700;">${q.correct_option}</span></td>
          <td>${q.category}</td>
        </tr>
      `).join('');

      // 3. Quiz Awards DB
      const tbodyAwards = document.getElementById('tbodyAwards');
      tbodyAwards.innerHTML = data.databases.database3_awards.map(a => `
        <tr>
          <td><strong style="color:#0284c7;">${a.claim_code}</strong></td>
          <td>${a.prize_title_en}</td>
          <td>${a.email_recipient}</td>
          <td><span style="background:#dcfce7;color:#15803d;padding:2px 8px;border-radius:4px;font-weight:700;">${a.email_status}</span></td>
          <td>${new Date(a.won_at).toLocaleTimeString()}</td>
        </tr>
      `).join('') || '<tr><td colspan="5" style="text-align:center;">No awards claimed yet</td></tr>';
    }
  } catch (e) {
    console.error('Inspector error:', e);
  }
}

async function openEmailsViewer() {
  const modal = document.getElementById('modalEmailsViewer');
  modal.classList.add('open');

  try {
    const res = await fetch('/api/admin/emails');
    const data = await res.json();
    const container = document.getElementById('emailsListContainer');

    if (data.emails.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:#64748b;">
        No emails dispatched yet. Spin the roulette to win a gift and trigger an email!
      </div>`;
      return;
    }

    container.innerHTML = data.emails.map(e => `
      <div class="email-preview-container">
        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
          <strong>To: ${e.recipient} (${e.clientName})</strong>
          <span style="font-size:11px; color:#64748b;">${new Date(e.timestamp).toLocaleTimeString()}</span>
        </div>
        <div style="font-size:13px; font-weight:700; color:#0284c7; margin-bottom:12px;">Subject: ${e.subject}</div>
        <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
          ${e.html}
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Emails viewer error:', err);
  }
}

// -------------------------------------------------------------
// 8. EVENT LISTENERS SETUP
// -------------------------------------------------------------
function initEventListeners() {
  // Brand logo click returns to welcome screen
  document.getElementById('brandLogoLink').addEventListener('click', () => {
    goToStep('welcome');
  });

  // Step 1: Start Button
  document.getElementById('btnStartExperience').addEventListener('click', () => {
    goToStep('form');
  });

  // Step 2: Passenger Form Validation
  setupFormValidation();

  // Step 3: Quiz Submit
  document.getElementById('btnSubmitQuiz').addEventListener('click', submitQuiz);

  // Step 4: Results actions
  document.getElementById('btnGoToRoulette').addEventListener('click', () => {
    goToStep('roulette');
  });
  document.getElementById('btnRetryQuiz').addEventListener('click', async () => {
    await fetchAndLoadQuiz();
    goToStep('quiz');
  });

  // Step 5: Roulette Spin
  document.getElementById('btnSpinRoulette').addEventListener('click', spinRoulette);
  document.getElementById('btnViewEmailFromAward').addEventListener('click', openEmailsViewer);
  document.getElementById('btnBackHome').addEventListener('click', () => {
    goToStep('welcome');
  });

  // Top header utility buttons
  document.getElementById('btnShowQr').addEventListener('click', () => {
    document.getElementById('modalQrCode').classList.add('open');
  });
  document.getElementById('btnDatabaseViewer').addEventListener('click', openDatabaseInspector);
  document.getElementById('btnEmailsViewer').addEventListener('click', openEmailsViewer);

  // Modal close handlers
  document.querySelectorAll('.modal-close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal-overlay').classList.remove('open');
    });
  });
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.remove('open');
      }
    });
  });

  // Database viewer tabs
  document.querySelectorAll('.db-tab-btn').forEach(tab => {
    tab.addEventListener('click', (e) => {
      document.querySelectorAll('.db-tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.db-tab-content').forEach(c => (c.style.display = 'none'));
      e.target.classList.add('active');
      const targetId = e.target.getAttribute('data-tab-target');
      document.getElementById(targetId).style.display = 'block';
    });
  });
}
