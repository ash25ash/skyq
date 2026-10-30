const config = require('../config');

// In-memory log of dispatched emails for instant preview and verification
const dispatchedEmails = [];

/**
 * Generates responsive branded HTML email template for prize notification
 */
function generateEmailTemplate({ client, prize, claimCode, language = 'en' }) {
  const isRo = language === 'ro';

  const subject = isRo
    ? `🎉 Felicitări, ${client.first_name}! Ai câștigat "${prize.title_ro}" cu SkyQ!`
    : `🎉 Congratulations ${client.first_name}! You won "${prize.title_en}" with SkyQ!`;

  const title = isRo
    ? 'Felicitări pentru Scorul Perfect la Quiz-ul SkyQ!'
    : 'Congratulations on Your Perfect SkyQ Quiz Score!';

  const intro = isRo
    ? `Stimate/Stimată <strong>${client.first_name} ${client.last_name}</strong>,<br>Vă mulțumim că ați călătorit cu noi pe zborul <strong>${client.flight_number}</strong> din data de <strong>${client.flight_date}</strong>. Ați demonstrat o cunoaștere impecabilă a aviației, răspunzând corect la toate cele 10 întrebări ale provocării SkyQ!`
    : `Dear <strong>${client.first_name} ${client.last_name}</strong>,<br>Thank you for flying with us on flight <strong>${client.flight_number}</strong> on <strong>${client.flight_date}</strong>. You demonstrated flawless aviation mastery by answering all 10 SkyQ Quiz questions correctly!`;

  const prizeLabel = isRo ? 'Cadoul Dvs. Câștigat:' : 'Your Awarded Gift:';
  const prizeTitle = isRo ? prize.title_ro : prize.title_en;
  const prizeDesc = isRo ? prize.description_ro : prize.description_en;
  const claimCodeLabel = isRo ? 'Cod Unic de Revendicare:' : 'Unique Voucher Claim Code:';
  const pickupLabel = isRo ? 'Punct de Ridicare & Instrucțiuni:' : 'Pickup Location & Instructions:';
  const pickupLoc = isRo ? prize.pickup_location_ro : prize.pickup_location_en;

  const instructions = isRo
    ? 'Pentru a vă ridica premiul, vă rugăm să prezentați acest e-mail (pe ecranul telefonului) și cartea de îmbarcare la biroul specificat mai sus. Premiul este valabil timp de 30 de zile de la data zborului.'
    : 'To claim your gift, please present this confirmation email (on your smartphone) along with your boarding pass at the location indicated above. This voucher is valid for 30 days from your flight date.';

  const footer = isRo
    ? 'Zbor plăcut și vă mulțumim că alegeți SkyQ.com — Calitate la orice altitudine.'
    : 'Have a pleasant flight and thank you for choosing SkyQ.com — Quality at any altitude.';

  const html = `
<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #e0f2fe;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0a2540;
    }
    .email-container {
      max-width: 600px;
      margin: 30px auto;
      background-color: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(10, 37, 64, 0.12);
      border: 1px solid #bae6fd;
    }
    .email-header {
      background: linear-gradient(135deg, #0a2540 0%, #1e3a8a 100%);
      color: #ffffff;
      padding: 35px 25px;
      text-align: center;
    }
    .email-header h1 {
      margin: 10px 0 0;
      font-size: 26px;
      letter-spacing: 1px;
    }
    .email-header .tagline {
      font-size: 13px;
      color: #7dd3fc;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .email-body {
      padding: 30px 25px;
      line-height: 1.6;
    }
    .greeting {
      font-size: 18px;
      font-weight: 700;
      color: #0a2540;
      margin-bottom: 15px;
    }
    .gift-box {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px dashed #0284c7;
      border-radius: 12px;
      padding: 22px;
      margin: 25px 0;
      text-align: center;
    }
    .gift-title {
      font-size: 22px;
      font-weight: 800;
      color: #0a2540;
      margin-top: 5px;
      margin-bottom: 8px;
    }
    .gift-desc {
      color: #1e3a8a;
      font-size: 14px;
      margin-bottom: 18px;
    }
    .claim-code-pill {
      display: inline-block;
      background-color: #0a2540;
      color: #38bdf8;
      font-family: 'Courier New', Courier, monospace;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: 3px;
      padding: 10px 24px;
      border-radius: 30px;
      box-shadow: 0 4px 12px rgba(10, 37, 64, 0.2);
    }
    .location-box {
      background-color: #f8fafc;
      border-left: 4px solid #0284c7;
      padding: 14px 18px;
      border-radius: 6px;
      margin: 20px 0;
    }
    .flight-badge {
      display: inline-block;
      background-color: #e2e8f0;
      color: #0f172a;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 5px;
    }
    .email-footer {
      background-color: #f1f5f9;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #64748b;
      border-top: 1px solid #e2e8f0;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="tagline">SkyQ.com • In-Flight Exclusive Experience</div>
      <h1>✈️ SkyQ Rewards Club</h1>
    </div>
    <div class="email-body">
      <div class="greeting">${title}</div>
      <p>${intro}</p>
      
      <div class="flight-badge">
        ✈️ ${client.flight_number} | 📅 ${client.flight_date}
      </div>

      <div class="gift-box">
        <div style="font-size: 13px; text-transform: uppercase; color: #0284c7; font-weight: 700;">${prizeLabel}</div>
        <div class="gift-title">🎁 ${prizeTitle}</div>
        <div class="gift-desc">${prizeDesc}</div>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${claimCodeLabel}</div>
        <div class="claim-code-pill">${claimCode}</div>
      </div>

      <div class="location-box">
        <div style="font-weight: 700; color: #0a2540; margin-bottom: 4px;">📍 ${pickupLabel}</div>
        <div style="font-size: 14px; color: #1e3a8a;"><strong>${pickupLoc}</strong></div>
      </div>

      <p style="font-size: 13px; color: #475569;">${instructions}</p>
      <p style="font-size: 14px; font-weight: 600; color: #0a2540;">${footer}</p>
    </div>
    <div class="email-footer">
      © ${new Date().getFullYear()} SkyQ Aviation Group. All rights reserved.<br>
      SkyQ.com Airport Concierge & Traveler Services.
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * Sends prize notification email to client
 */
async function sendPrizeEmail({ client, prize, claimCode, language = 'en' }) {
  const { subject, html } = generateEmailTemplate({ client, prize, claimCode, language });
  const recipient = client.email;
  const timestamp = new Date().toISOString();

  const emailRecord = {
    id: 'eml_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
    recipient,
    clientName: `${client.first_name} ${client.last_name}`,
    flightNumber: client.flight_number,
    prizeTitle: language === 'ro' ? prize.title_ro : prize.title_en,
    claimCode,
    subject,
    html,
    timestamp,
    status: 'DELIVERED (SIMULATED / SMTP READY)'
  };

  dispatchedEmails.unshift(emailRecord);

  // Keep max 50 recent emails in memory
  if (dispatchedEmails.length > 50) {
    dispatchedEmails.pop();
  }

  console.log(`[EMAIL DISPATCHED] To: ${recipient} | Subject: ${subject} | Code: ${claimCode}`);

  return emailRecord;
}

function getRecentDispatchedEmails() {
  return dispatchedEmails;
}

module.exports = {
  sendPrizeEmail,
  generateEmailTemplate,
  getRecentDispatchedEmails
};
