-- ====================================================================
-- DATABASE 3: QUIZ SUBMISSIONS & AWARDS DATABASE (quiz_awards.db)
-- Stores answers given to the quiz, scoring results, and awards won by clients
-- ====================================================================

CREATE TABLE IF NOT EXISTS quiz_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_uuid TEXT NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 10,
    correct_count INTEGER NOT NULL,
    score_percent REAL NOT NULL,
    is_perfect INTEGER NOT NULL DEFAULT 0, -- 1 if 10/10, 0 otherwise
    answers_json TEXT NOT NULL,           -- records question codes, answers chosen, correct options
    submitted_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_client ON quiz_submissions(client_uuid);
CREATE INDEX IF NOT EXISTS idx_submissions_perfect ON quiz_submissions(is_perfect);

CREATE TABLE IF NOT EXISTS client_awards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_uuid TEXT NOT NULL,
    submission_id INTEGER NOT NULL,
    prize_id TEXT NOT NULL,
    prize_title_en TEXT NOT NULL,
    prize_title_ro TEXT NOT NULL,
    prize_description_en TEXT NOT NULL,
    prize_description_ro TEXT NOT NULL,
    pickup_location_en TEXT NOT NULL,
    pickup_location_ro TEXT NOT NULL,
    claim_code TEXT UNIQUE NOT NULL,
    email_recipient TEXT NOT NULL,
    email_status TEXT DEFAULT 'SENT', -- SENT, PENDING, FAILED
    email_sent_at TEXT NOT NULL,
    email_subject TEXT NOT NULL,
    email_body_html TEXT NOT NULL,
    won_at TEXT NOT NULL,
    is_redeemed INTEGER DEFAULT 0,
    redeemed_at TEXT,
    FOREIGN KEY(submission_id) REFERENCES quiz_submissions(id)
);

CREATE INDEX IF NOT EXISTS idx_awards_client ON client_awards(client_uuid);
CREATE INDEX IF NOT EXISTS idx_awards_claim_code ON client_awards(claim_code);

-- Standard roulette prizes catalog
CREATE TABLE IF NOT EXISTS prizes_catalog (
    id TEXT PRIMARY KEY,
    title_en TEXT NOT NULL,
    title_ro TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ro TEXT NOT NULL,
    pickup_location_en TEXT NOT NULL,
    pickup_location_ro TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    text_color_hex TEXT NOT NULL,
    probability_weight INTEGER DEFAULT 10
);

INSERT OR IGNORE INTO prizes_catalog (
    id, title_en, title_ro, description_en, description_ro,
    pickup_location_en, pickup_location_ro, color_hex, text_color_hex, probability_weight
) VALUES
(
    'PRZ_LOUNGE',
    'VIP Lounge Day Pass',
    'Permis VIP SkyQ Lounge',
    'Complimentary access to the exclusive SkyQ Executive Lounge with buffet, cocktails, and private relaxation pods.',
    'Acces gratuit în Salonul Executiv SkyQ cu bufet suedez, cocktailuri și capsule private de relaxare.',
    'Airport Terminal 1, SkyQ Lounge Reception (Gate B4)',
    'Aeroport Terminal 1, Recepția SkyQ Lounge (Poarta B4)',
    '#0A2540', '#FFFFFF', 15
),
(
    'PRZ_DUTYFREE',
    '25% Duty-Free Voucher',
    'Voucher 25% Reducere Duty-Free',
    'Enjoy a 25% discount voucher on luxury perfumes, watches, and travel accessories across all airport duty-free shops.',
    'Bucură-te de un discount de 25% la parfumuri de lux, ceasuri și accesorii în magazinele Duty-Free din aeroport.',
    'Terminal 1 & 2 Main Duty-Free Cash Desks (Present SkyQ Claim Code)',
    'Casele principale Duty-Free Terminal 1 & 2 (Prezentați codul SkyQ)',
    '#3B82F6', '#FFFFFF', 15
),
(
    'PRZ_CHAMPAGNE',
    'Gourmet Meal & Champagne',
    'Meniu Gourmet & Șampanie',
    'A complimentary chef-curated gourmet meal with chilled French champagne served aboard your flight or at gate dining.',
    'Un meniu gourmet pregătit de un bucătar-șef și șampanie franțuzească rece, servite la bord sau la poartă.',
    'In-Flight Chief Purser or Gate Service Desk upon boarding',
    'Șeful de cabină la bord sau biroul de îmbarcare',
    '#0284C7', '#FFFFFF', 15
),
(
    'PRZ_AIRCRAFT_MODEL',
    'SkyQ Die-Cast Model Jet',
    'Machetă Avion Colecție SkyQ',
    'Limited-edition 1:200 scale metal die-cast replica of the flagship SkyQ Boeing 787 Dreamliner.',
    'Machetă oficială de colecție la scară 1:200 a aeronavei fanion SkyQ Boeing 787 Dreamliner.',
    'SkyQ Information & Customer Care Desk, Terminal 1 Central Hall',
    'Biroul SkyQ Asistență Clienți, Terminal 1 Holul Central',
    '#0369A1', '#FFFFFF', 10
),
(
    'PRZ_MILES',
    '2,500 SkyMiles Bonus',
    '2.500 SkyMiles Bonus',
    '2,500 loyalty miles credited instantly to your SkyQ Frequent Flyer account for future flights.',
    '2.500 de mile de loialitate creditate instant în contul dumneavoastră SkyQ Frequent Flyer.',
    'Credited directly to account & voucher sent to passenger email',
    'Creditat direct în cont și trimis prin e-mail',
    '#1D4ED8', '#FFFFFF', 15
),
(
    'PRZ_SLEEP_KIT',
    'Luxury Comfort Travel Kit',
    'Set de Călătorie Confort de Lux',
    'Premium travel package featuring cashmere eye-mask, memory foam neck pillow, and L''Occitane amenities.',
    'Pachet premium de călătorie cu mască din cașmir, pernă ergonomică și produse cosmetice L''Occitane.',
    'SkyQ Boarding Gate Priority Desk (Show digital pass)',
    'Biroul Prioritar SkyQ de la Poarta de Îmbarcare',
    '#0EA5E9', '#FFFFFF', 10
),
(
    'PRZ_WIFI',
    'Full-Flight High-Speed Wi-Fi',
    'Wi-Fi de Mare Viteză pe Tot Zborul',
    'Unlimited high-speed streaming in-flight satellite internet voucher for up to 3 personal devices.',
    'Voucher de internet prin satelit de mare viteză pe întreaga durată a zborului pentru 3 dispozitive.',
    'Instant activation code delivered via email and on-screen',
    'Cod de activare instant livrat pe e-mail și pe ecran',
    '#2563EB', '#FFFFFF', 10
),
(
    'PRZ_CHOCOLATE',
    'Belgian Chocolates & Coffee',
    'Ciocolată Belgiană & Cafea Barista',
    'Artisanal Belgian praline gift box and complimentary handcrafted specialty barista coffee voucher.',
    'Cutie de praline artizanale belgiene și voucher pentru o cafea artizanală preparată de barista.',
    'SkyQ Barista Café, Terminal 1 Departures Promenade',
    'SkyQ Barista Café, Terminal 1 Plecări',
    '#1E40AF', '#FFFFFF', 10
);
