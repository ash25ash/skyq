/**
 * SkyQ Bilingual Localization Dictionary (English & Romanian)
 */
const translations = {
  en: {
    // Header & Meta
    appTitle: "SkyQ.com - In-Flight Portal",
    domainBadge: "SkyQ.com",
    btnShowQr: "Boarding Pass QR",
    btnDatabaseViewer: "3 Databases Inspector",
    btnEmailsViewer: "Sent Emails",
    
    // Step 1: Welcome
    welcomeTag: "Official SkyQ In-Flight Experience",
    welcomeTitle: "Welcome aboard SkyQ.com",
    welcomeSubtitle: "Thank you for flying with us today! Test your aviation knowledge with our 10-question challenge. Score 10 out of 10 and spin the Lucky Roulette to win exclusive luxury gifts delivered directly to your email!",
    welcomeFeature1Title: "10 Aviation Questions",
    welcomeFeature1Desc: "Randomized questions & answers testing your flight knowledge.",
    welcomeFeature2Title: "Exclusive Roulette",
    welcomeFeature2Desc: "Answer all 10 correctly to unlock the wheel of luxury travel gifts.",
    welcomeFeature3Title: "Instant Delivery",
    welcomeFeature3Desc: "Receive your prize voucher code & pickup desk location via email.",
    welcomeStartBtn: "Start Experience ➔",
    
    // Step 2: Passenger Details Form
    formTitle: "Passenger & Flight Verification",
    formSubtitle: "Please introduce your flight credentials as stated on your boarding pass. All fields are verified before starting the quiz.",
    labelFirstName: "First Name",
    phFirstName: "e.g. Alexander",
    labelLastName: "Last Name",
    phLastName: "e.g. Vancea",
    labelEmail: "Email Address",
    phEmail: "e.g. alexander.vancea@example.com",
    hintEmail: "Your gift voucher & pickup instructions will be emailed here.",
    labelFlightNumber: "Flight Number",
    phFlightNumber: "e.g. SQ 402 or RO 302",
    hintFlightNumber: "2-letter airline code followed by flight number.",
    labelFlightDate: "Date of the Flight",
    btnProceedToQuiz: "Proceed to Quiz ➔",
    
    // Form Validation Errors
    errFirstName: "Please enter a valid first name (minimum 2 characters).",
    errLastName: "Please enter a valid last name (minimum 2 characters).",
    errEmail: "Please enter a valid email address.",
    errFlightNumber: "Please enter a valid flight number (e.g. SQ 402, RO 302).",
    errFlightDate: "Please select your flight date.",
    errFormGeneral: "Please complete all fields correctly to proceed to the quiz.",

    // Step 3: Quiz Screen
    quizHeaderTitle: "SkyQ Aviation Challenge",
    quizHeaderSubtitle: "Answer all 10 questions below. All questions are listed at once in randomized order. Select one answer per question.",
    quizPassengerBadge: "Passenger:",
    quizFlightBadge: "Flight:",
    quizProgressNotice: "Select an answer for each of the 10 questions before submitting.",
    quizQuestionLabel: "Question",
    quizOptionSelect: "Option",
    btnSubmitQuiz: "Submit Answers ➔",
    errQuizIncomplete: "Please select an answer for all 10 questions before submitting (Remaining: {count}).",
    quizLoading: "Preparing your randomized aviation questions...",

    // Step 4: Results Screen
    resultsTitle: "Quiz Results",
    resultsScoreText: "You got {correct} out of {total} answers right!",
    resultsPerfectTitle: "🎉 Outstanding! 10 out of 10 Perfect Score!",
    resultsPerfectDesc: "Flawless aeronautical knowledge! You have unlocked the exclusive SkyQ Lucky Roulette. Spin the wheel to claim your luxury prize!",
    btnGoToRoulette: "Proceed to Lucky Roulette ➔",
    resultsFailTitle: "Almost there! Keep your wings high!",
    resultsFailDesc: "You answered {correct} out of 10 correctly. To unlock the Lucky Roulette and win a gift, a perfect score of 10/10 is required.",
    btnRetryQuiz: "Retake Quiz with New Questions 🔄",
    resultsBreakdownTitle: "Answer Review & Detailed Explanations",
    badgeCorrect: "Correct",
    badgeIncorrect: "Incorrect",

    // Step 5: Roulette Screen
    rouletteTitle: "SkyQ Lucky Roulette",
    rouletteSubtitle: "Spin the wheel to win your exclusive SkyQ traveler gift! An official confirmation email with your voucher code and pickup location will be sent immediately.",
    btnSpinRoulette: "SPIN THE WHEEL ✈️",
    spinningNotice: "Spinning the wheel... Good luck!",
    rouletteWinnerTitle: "🎉 Congratulations! You Won:",
    labelClaimCode: "Your Claim Code:",
    labelPickupLocation: "Where to pick it up:",
    labelEmailNotice: "A confirmation email has been dispatched to:",
    btnViewDispatchedEmail: "Preview Sent Email ✉️",
    btnBackHome: "Finish & Return Home",

    // Modals
    modalQrTitle: "Scan QR Code for SkyQ.com",
    modalQrDesc: "Scan this QR code with your mobile smartphone camera at the airport or in-flight to open SkyQ.com immediately.",
    modalQrUrlLabel: "Access URL:",
    modalClose: "Close",
    modalDbTitle: "SkyQ 3-Database System Architecture",
    modalDbTab1: "1. Clients Database",
    modalDbTab2: "2. Questions Database",
    modalDbTab3: "3. Quiz & Awards Database",
    modalEmailsTitle: "SkyQ Email Dispatcher Monitor"
  },

  ro: {
    // Header & Meta
    appTitle: "SkyQ.com - Portal la Bord",
    domainBadge: "SkyQ.com",
    btnShowQr: "QR Carte Îmbarcare",
    btnDatabaseViewer: "Inspector 3 Baze de Date",
    btnEmailsViewer: "E-mailuri Trimise",
    
    // Step 1: Welcome
    welcomeTag: "Experiența Oficială la Bord SkyQ",
    welcomeTitle: "Bine ați venit la bordul SkyQ.com",
    welcomeSubtitle: "Vă mulțumim că zburați astăzi alături de noi! Testați-vă cunoștințele de aviație în provocarea cu 10 întrebări. Răspundeți corect la toate cele 10 întrebări și învârtiți Ruleta Norocoasă pentru a câștiga premii exclusive livrate direct pe adresa dumneavoastră de e-mail!",
    welcomeFeature1Title: "10 Întrebări de Aviație",
    welcomeFeature1Desc: "Întrebări și variante de răspuns afișate într-o ordine aleatorie.",
    welcomeFeature2Title: "Ruletă Exclusivă",
    welcomeFeature2Desc: "Răspundeți corect la toate cele 10 pentru a debloca roata cu premii de lux.",
    welcomeFeature3Title: "Livrare Imediată",
    welcomeFeature3Desc: "Primiți codul voucherului și punctul de ridicare din aeroport prin e-mail.",
    welcomeStartBtn: "Începe Experiența ➔",
    
    // Step 2: Passenger Details Form
    formTitle: "Verificare Pasager & Detalii Zbor",
    formSubtitle: "Vă rugăm să introduceți datele de zbor conform cărții de îmbarcare. Toate câmpurile sunt validate înainte de a accesa testul.",
    labelFirstName: "Prenume",
    phFirstName: "ex. Alexandru",
    labelLastName: "Nume de Familie",
    phLastName: "ex. Vancea",
    labelEmail: "Adresă de E-mail",
    phEmail: "ex. alexandru.vancea@exemplu.ro",
    hintEmail: "Voucherul cadou și detaliile de ridicare vor fi trimise pe acest e-mail.",
    labelFlightNumber: "Număr Zbor",
    phFlightNumber: "ex. RO 302 sau SQ 402",
    hintFlightNumber: "Codul companiei aeriene urmat de numărul zborului.",
    labelFlightDate: "Data Zborului",
    btnProceedToQuiz: "Mergi la Quiz ➔",
    
    // Form Validation Errors
    errFirstName: "Vă rugăm să introduceți un prenume valid (minim 2 caractere).",
    errLastName: "Vă rugăm să introduceți un nume de familie valid (minim 2 caractere).",
    errEmail: "Vă rugăm să introduceți o adresă de e-mail validă.",
    errFlightNumber: "Vă rugăm să introduceți un număr de zbor valid (ex. RO 302, SQ 402).",
    errFlightDate: "Vă rugăm să selectați data zborului.",
    errFormGeneral: "Vă rugăm să completați corect toate câmpurile pentru a putea continua.",

    // Step 3: Quiz Screen
    quizHeaderTitle: "Provocarea de Aviație SkyQ",
    quizHeaderSubtitle: "Răspundeți la toate cele 10 întrebări de mai jos. Toate întrebările sunt afișate simultan, într-o ordine aleatorie. Selectați o singură variantă pentru fiecare întrebare.",
    quizPassengerBadge: "Pasager:",
    quizFlightBadge: "Zbor:",
    quizProgressNotice: "Selectați câte un răspuns pentru fiecare dintre cele 10 întrebări înainte de trimitere.",
    quizQuestionLabel: "Întrebarea",
    quizOptionSelect: "Varianta",
    btnSubmitQuiz: "Trimite Răspunsurile ➔",
    errQuizIncomplete: "Vă rugăm să răspundeți la toate cele 10 întrebări înainte de a trimite (Rămase: {count}).",
    quizLoading: "Pregătim întrebările aleatorii despre aviație...",

    // Step 4: Results Screen
    resultsTitle: "Rezultatele Quiz-ului",
    resultsScoreText: "Ați răspuns corect la {correct} din {total} întrebări!",
    resultsPerfectTitle: "🎉 Remarcabil! Scor Perfect 10 din 10!",
    resultsPerfectDesc: "Cunoștințe aeronautice impecabile! Ați deblocat Ruleta Norocoasă SkyQ. Învârtiți roata pentru a câștiga premiul dumneavoastră!",
    btnGoToRoulette: "Mergi la Ruleta Norocoasă ➔",
    resultsFailTitle: "Aproape ați reușit! Nu renunțați!",
    resultsFailDesc: "Ați răspuns corect la {correct} din 10 întrebări. Pentru a debloca Ruleta Norocoasă și a câștiga un premiu, este necesar un scor perfect de 10/10.",
    btnRetryQuiz: "Reîncearcă Quiz-ul cu Întrebări Noi 🔄",
    resultsBreakdownTitle: "Revizuirea Răspunsurilor & Explicații",
    badgeCorrect: "Corect",
    badgeIncorrect: "Incorect",

    // Step 5: Roulette Screen
    rouletteTitle: "Ruleta Norocoasă SkyQ",
    rouletteSubtitle: "Învârtiți ruleta pentru a câștiga un cadou exclusiv SkyQ! Veți primi imediat un e-mail oficial cu voucherul și locul din aeroport de unde îl puteți ridica.",
    btnSpinRoulette: "ÎNVÂRTE RULETA ✈️",
    spinningNotice: "Ruleta se învârte... Mult noroc!",
    rouletteWinnerTitle: "🎉 Felicitări! Ați Câștigat:",
    labelClaimCode: "Codul Dvs. de Revendicare:",
    labelPickupLocation: "Locația de ridicare a premiului:",
    labelEmailNotice: "Un e-mail de confirmare a fost expediat la:",
    btnViewDispatchedEmail: "Previzualizează E-mailul Trimis ✉️",
    btnBackHome: "Finalizează & Înapoi la Pagina Principală",

    // Modals
    modalQrTitle: "Scanați Codul QR pentru SkyQ.com",
    modalQrDesc: "Scanați acest cod QR cu camera telefonului mobil în aeroport sau la bord pentru a accesa instantaneu SkyQ.com.",
    modalQrUrlLabel: "URL de acces:",
    modalClose: "Închide",
    modalDbTitle: "Arhitectura celor 3 Baze de Date SkyQ",
    modalDbTab1: "1. Baza de Date Clienți",
    modalDbTab2: "2. Baza de Date Întrebări",
    modalDbTab3: "3. Baza Quiz & Premii",
    modalEmailsTitle: "Monitor Dispecerat E-mailuri SkyQ"
  }
};

let currentLang = 'en';

function setLanguage(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('skyq_lang', lang);
    applyTranslations();
  }
}

function getTranslation(key, params = {}) {
  const dict = translations[currentLang] || translations.en;
  let text = dict[key] || translations.en[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = getTranslation(key);
  });

  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    el.placeholder = getTranslation(key);
  });

  // Update active state of language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.getAttribute('data-lang') === currentLang) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  document.documentElement.lang = currentLang;
}
