-- ==========================================================================
-- MODERN VILLAGE: GOVERNMENT SCHEMES & BENEFITS SCHEMA & RLS POLICIES
-- Clean, Public, Read-Accessible Civic Schemes Catalog
-- ==========================================================================

CREATE TABLE IF NOT EXISTS public.government_schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scheme_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    name_kn TEXT NOT NULL,
    category TEXT NOT NULL,
    category_id TEXT NOT NULL,
    category_kn TEXT NOT NULL,
    government_level TEXT NOT NULL CHECK (government_level IN ('Central Government', 'Karnataka State Government')),
    government_level_kn TEXT NOT NULL,
    short_description TEXT NOT NULL,
    short_description_kn TEXT NOT NULL,
    benefits TEXT NOT NULL,
    benefits_kn TEXT NOT NULL,
    eligibility TEXT NOT NULL,
    eligibility_kn TEXT NOT NULL,
    documents_required TEXT NOT NULL,
    documents_required_kn TEXT NOT NULL,
    official_url TEXT NOT NULL,
    apply_url TEXT,
    last_verified_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.government_schemes ENABLE ROW LEVEL SECURITY;

-- 1. Public Read Policy: Allow anyone (unauthenticated and authenticated citizens) to view active schemes
DROP POLICY IF EXISTS "Public can view active government schemes" ON public.government_schemes;
CREATE POLICY "Public can view active government schemes" 
    ON public.government_schemes 
    FOR SELECT 
    USING (is_active = true);

-- 2. Panchayat/Admin Policy: Only authorized officials can modify scheme records
DROP POLICY IF EXISTS "Officials can manage schemes" ON public.government_schemes;
CREATE POLICY "Officials can manage schemes" 
    ON public.government_schemes 
    FOR ALL 
    TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role IN ('panchayat_official', 'admin')
        )
    );

-- Seed Data: Insert initial verified schemes
INSERT INTO public.government_schemes (
    scheme_code, name, name_kn, category, category_id, category_kn,
    government_level, government_level_kn,
    short_description, short_description_kn,
    benefits, benefits_kn,
    eligibility, eligibility_kn,
    documents_required, documents_required_kn,
    official_url, apply_url, last_verified_date
) VALUES
(
    'PM-KISAN',
    'PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)',
    'ಪಿಎಂ-ಕಿಸಾನ್ (ಪ್ರಧಾನ ಮಂತ್ರಿ ಕಿಸಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ)',
    'Agriculture & Farmers', 'agriculture', 'ಕೃಷಿ ಮತ್ತು ರೈತರು',
    'Central Government', 'ಕೇಂದ್ರ ಸರ್ಕಾರ',
    'Direct income support of ₹6,000 per year paid in three equal installments to farmer families across India.',
    'ದೇಶದ ಎಲ್ಲಾ ಅರ್ಹ ರೈತ ಕುಟುಂಬಗಳಿಗೆ ವಾರ್ಷಿಕ ₹6,000 ನೇರ ಆರ್ಥಿಕ ಸಹಾಯವನ್ನು ಮೂರು ಸಮಾನ ಕಂತುಗಳಲ್ಲಿ ಒದಗಿಸಲಾಗುತ್ತದೆ.',
    '₹6,000 annually credited directly into Aadhaar-seeded bank accounts in 3 installments of ₹2,000 every 4 months.',
    'ಪ್ರತಿ 4 ತಿಂಗಳಿಗೊಮ್ಮೆ ₹2,000 ದಂತೆ 3 ಕಂತುಗಳಲ್ಲಿ ವಾರ್ಷಿಕ ₹6,000 ನೇರವಾಗಿ ಆಧಾರ್ ಜೋಡಣೆಗೊಂಡ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಜಮೆಯಾಗುತ್ತದೆ.',
    'All landholding farmer families with cultivable land parcels in their names.',
    'ತಮ್ಮ ಹೆಸರಿನಲ್ಲಿ ಸಾಗುವಳಿ ಭೂಮಿ ಹೊಂದಿರುವ ಎಲ್ಲಾ ರೈತ ಕುಟುಂಬಗಳು.',
    'Aadhaar Card, Land ownership papers (Record of Rights / Pahani / RTC), Active Bank Account Passbook seeded with Aadhaar, Mobile Number.',
    'ಆಧಾರ್ ಕಾರ್ಡ್, ಪಹಣಿ/ಆರ್‌ಟಿಸಿ (RTC), ಆಧಾರ್ ಜೋಡಣೆ ಹೊಂದಿರುವ ಬ್ಯಾಂಕ್ ಖಾತೆ ಪಾಸ್‌ಬುಕ್, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ.',
    'https://pmkisan.gov.in/',
    'https://pmkisan.gov.in/RegistrationFormNew.aspx',
    '2026-10-15'
),
(
    'GRUHA-LAKSHMI',
    'Gruha Lakshmi Scheme (ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ)',
    'ಗೃಹ ಲಕ್ಷ್ಮಿ ಯೋಜನೆ',
    'Karnataka State Government Schemes', 'karnataka_state', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು',
    'Karnataka State Government', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರ',
    'Monthly financial assistance of ₹2,000 to the woman head of household in Karnataka to enhance gender equity and family welfare.',
    'ಕರ್ನಾಟಕದ ಕುಟುಂಬದ ಮಹಿಳಾ ಯಜಮಾನಿಗೆ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ಆರ್ಥಿಕ ನೆರವು ನೀಡುವ ಪ್ರಮುಖ ಗ್ಯಾರಂಟಿ ಯೋಜನೆ.',
    '₹2,000 per month deposited directly via Direct Benefit Transfer (DBT) into the bank account of the registered woman head of family.',
    'ಕುಟುಂಬದ ಮಹಿಳಾ ಯಜಮಾನಿಯ ಬ್ಯಾಂಕ್ ಖಾತೆಗೆ ಡಿಬಿಟಿ (DBT) ಮೂಲಕ ಪ್ರತಿ ತಿಂಗಳು ₹2,000 ನೇರ ನಗದು ವರ್ಗಾವಣೆ.',
    'Woman designated as head of the family on Antyodaya (AAY), BPL, or APL ration cards issued by Karnataka Food & Civil Supplies Dept.',
    'ಕರ್ನಾಟಕ ಸರ್ಕಾರದ ಅಂತ್ಯೋದಯ, ಬಿಪಿಎಲ್ ಅಥವಾ ಎಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿಯಲ್ಲಿ ಮಹಿಳಾ ಯಜಮಾನಿ ಎಂದು ನಮೂದಾಗಿರುವ ಮಹಿಳೆ.',
    'Ration Card (BPL / AAY / APL), Aadhaar Card of woman head of household, Aadhaar Card of husband, Bank passbook linked to Aadhaar.',
    'ಪಡಿತರ ಚೀಟಿ (BPL/AAY/APL), ಮಹಿಳೆಯ ಆಧಾರ್ ಕಾರ್ಡ್, ಪತಿಯ ಆಧಾರ್ ಕಾರ್ಡ್, ಆಧಾರ್ ಲಿಂಕ್ ಆದ ಬ್ಯಾಂಕ್ ಪಾಸ್‌ಬುಕ್.',
    'https://sevasindhugs.karnataka.gov.in/',
    'https://sevasindhugs.karnataka.gov.in/',
    '2026-10-18'
),
(
    'YUVA-NIDHI',
    'Yuva Nidhi Scheme (ಯುವ ನಿಧಿ ಯೋಜನೆ)',
    'ಯುವ ನಿಧಿ ಯೋಜನೆ',
    'Karnataka State Government Schemes', 'karnataka_state', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು',
    'Karnataka State Government', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರ',
    'Monthly unemployment allowance of ₹3,000 for degree holders and ₹1,500 for diploma holders in Karnataka while seeking employment.',
    'ಉದ್ಯೋಗ ಹುಡುಕುತ್ತಿರುವ ಕರ್ನಾಟಕದ ಪದವೀಧರರಿಗೆ ₹3,000 ಮತ್ತು ಡಿಪ್ಲೊಮಾ ಹೊಂದಿದವರಿಗೆ ₹1,500 ಮಾಸಿಕ ನಿರುದ್ಯೋಗ ಭತ್ಯೆ.',
    '₹3,000/month for unemployed graduates and ₹1,500/month for unemployed diploma holders for up to two years or until employment.',
    'ನಿರುದ್ಯೋಗಿ ಪದವೀಧರರಿಗೆ ತಿಂಗಳಿಗೆ ₹3,000 ಹಾಗೂ ಡಿಪ್ಲೊಮಾ ಪದವೀಧರರಿಗೆ ತಿಂಗಳಿಗೆ ₹1,500 ಗರಿಷ್ಠ 2 ವರ್ಷಗಳ ಅವಧಿಗೆ.',
    'Students domiciled in Karnataka who completed degree or diploma and remained unemployed for at least 6 months (180 days).',
    'ಕರ್ನಾಟಕದಲ್ಲಿ ವ್ಯಾಸಂಗ ಮುಗಿಸಿ ಕನಿಷ್ಠ 180 ದಿನಗಳು ನಿರುದ್ಯೋಗಿಯಾಗಿರುವ ಪದವಿ/ಡಿಪ್ಲೊಮಾ ವಿದ್ಯಾರ್ಥಿಗಳು.',
    'Degree/Diploma Marks Cards & Convocation Certificate, Domicile Certificate / SSLC Marks Card, Aadhaar Card, Bank Account linked to Aadhaar.',
    'ಪದವಿ/ಡಿಪ್ಲೊಮಾ ಅಂಕಪಟ್ಟಿ, ವಾಸಸ್ಥಳ ದೃಢೀಕರಣ ಪತ್ರ, ಆಧಾರ್ ಕಾರ್ಡ್, ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ.',
    'https://sevasindhugs.karnataka.gov.in/',
    'https://sevasindhugs.karnataka.gov.in/',
    '2026-10-20'
),
(
    'SHAKTI-SCHEME',
    'Shakti Scheme (ಶಕ್ತಿ ಯೋಜನೆ - ಉಚಿತ ಬಸ್ ಪ್ರಯಾಣ)',
    'ಶಕ್ತಿ ಯೋಜನೆ (ಉಚಿತ ಬಸ್ ಪ್ರಯಾಣ)',
    'Karnataka State Government Schemes', 'karnataka_state', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರದ ಯೋಜನೆಗಳು',
    'Karnataka State Government', 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಸರ್ಕಾರ',
    'Free travel for all women and transgender residents of Karnataka in non-premium state government transport buses.',
    'ಕರ್ನಾಟಕ ರಾಜ್ಯ ರಸ್ತೆ ಸಾರಿಗೆ ಸಂಸ್ಥೆಯ ಬಸ್‌ಗಳಲ್ಲಿ ಮಹಿಳೆಯರು ಮತ್ತು ಲಿಂಗತ್ವ ಅಲ್ಪಸಂಖ್ಯಾತರಿಗೆ ಉಚಿತ ಪ್ರಯಾಣ ಸೌಲಭ್ಯ.',
    '100% free bus travel within Karnataka borders on KSRTC, BMTC, NWKRTC, and KKRTC ordinary and express buses.',
    'ಕೆಎಸ್‌ಆರ್‌ಟಿಸಿ, ಬಿಎಂಟಿಸಿ, ವಾಯವ್ಯ ಹಾಗೂ ಕಲ್ಯಾಣ ಕರ್ನಾಟಕ ಸಾರಿಗೆ ಬಸ್‌ಗಳಲ್ಲಿ ರಾಜ್ಯಾದ್ಯಂತ ಶೇ.100 ರಷ್ಟು ಉಚಿತ ಪ್ರಯಾಣ.',
    'All women, girl students, and transgender persons permanently residing in the state of Karnataka.',
    'ಕರ್ನಾಟಕ ರಾಜ್ಯದಲ್ಲಿ ನೆಲೆಸಿರುವ ಎಲ್ಲಾ ಮಹಿಳೆಯರು, ವಿದ್ಯಾರ್ಥಿನಿಯರು ಹಾಗೂ ತೃತೀಯ ಲಿಂಗಿಗಳು.',
    'Government-issued photo identification proof displaying Karnataka address (Aadhaar Card, Voter ID Card, Driving License, or Shakti Smart Card).',
    'ಕರ್ನಾಟಕದ ವಿಳಾಸವಿರುವ ಸರ್ಕಾರಿ ಭಾವಚಿತ್ರ ಗುರುತಿನ ಚೀಟಿ (ಆಧಾರ್ ಕಾರ್ಡ್, ಮತದಾರರ ಗುರುತಿನ ಚೀಟಿ, ಚಾಲನಾ ಪರವಾನಗಿ).',
    'https://ksrtc.karnataka.gov.in/',
    'https://sevasindhu.karnataka.gov.in/',
    '2026-10-12'
),
(
    'PMAY-G',
    'Pradhan Mantri Awas Yojana - Gramin (PMAY-G)',
    'ಪ್ರಧಾನ ಮಂತ್ರಿ ಆವಾಸ್ ಯೋಜನೆ - ಗ್ರಾಮೀಣ (PMAY-G)',
    'Housing', 'housing', 'ವಸತಿ',
    'Central Government', 'ಕೇಂದ್ರ ಸರ್ಕಾರ',
    'Financial assistance to rural houseless and kutcha-house dwelling families to construct permanent, resilient pucca homes.',
    'ಗ್ರಾಮೀಣ ಪ್ರದೇಶದ ವಸತಿ ರಹಿತ ಮತ್ತು ಶಿಥಿಲ ಮನೆಯಲ್ಲಿ ವಾಸಿಸುವ ಕುಟುಂಬಗಳಿಗೆ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಿಸಲು ಆರ್ಥಿಕ ನೆರವು.',
    'Grant of ₹1,20,000 in plain areas and ₹1,30,000 in hilly/difficult regions, plus 90-95 days of unskilled labor wages under MGNREGA and ₹12,000 for toilet construction.',
    'ಸಾಮಾನ್ಯ ಪ್ರದೇಶಗಳಲ್ಲಿ ₹1,20,000 ಮತ್ತು ಗುಡ್ಡಗಾಡು ಪ್ರದೇಶಗಳಲ್ಲಿ ₹1,30,000 ಅನುದಾನ, ಜೊತೆಗೆ ಉದ್ಯೋಗ ಖಾತರಿ ಅಡಿಯಲ್ಲಿ ಕೂಲಿ ನೆರವು.',
    'Rural families living in zero, one, or two-room houses with kutcha walls and roof as identified by SECC census and endorsed by Gram Sabha.',
    'ಸಾಮಾಜಿಕ, ಆರ್ಥಿಕ ಮತ್ತು ಜಾತಿ ಗಣತಿಯನ್ವಯ (SECC) ಗುರುತಿಸಲಾದ ಮತ್ತು ಗ್ರಾಮ ಸಭೆಯಿಂದ ಅನುಮೋದಿಸಲ್ಪಟ್ಟ ಗ್ರಾಮೀಣ ಬಡ ಕುಟುಂಬಗಳು.',
    'Aadhaar Card, MGNREGA Job Card Number, Bank Account Passbook, Land / Homestead plot ownership or patta paper, Gram Sabha resolution copy.',
    'ಆಧಾರ್ ಕಾರ್ಡ್, ಉದ್ಯೋಗ ಖಾತರಿ ಜಾಬ್ ಕಾರ್ಡ್, ಬ್ಯಾಂಕ್ ಖಾತೆ ವಿವರ, ಜಾಗದ ಹಕ್ಕುಪತ್ರ/ಪಟ್ಟಾ.',
    'https://pmayg.nic.in/',
    'https://pmayg.nic.in/netiay/',
    '2026-10-14'
),
(
    'AB-PMJAY',
    'Ayushman Bharat - PM-JAY (Jan Arogya Yojana)',
    'ಆಯುಷ್ಮಾನ್ ಭಾರತ್ - ಪ್ರಧಾನ ಮಂತ್ರಿ ಜನ ಆರೋಗ್ಯ ಯೋಜನೆ',
    'Health & Healthcare', 'health', 'ಆರೋಗ್ಯ ಮತ್ತು ಆರೋಗ್ಯ ಸೇವೆಗಳು',
    'Central Government', 'ಕೇಂದ್ರ ಸರ್ಕಾರ',
    'World''s largest government-funded health assurance scheme providing ₹5 Lakh annual health coverage per family.',
    'ಪ್ರತಿ ಕುಟುಂಬಕ್ಕೆ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ಉಚಿತ ನಗದು ರಹಿತ ಚಿಕಿತ್ಸೆ ನೀಡುವ ವಿಶ್ವದ ಅತಿ ದೊಡ್ಡ ಆರೋಗ್ಯ ರಕ್ಷಾ ಯೋಜನೆ.',
    'Comprehensive cashless secondary and tertiary hospitalization coverage up to ₹5,00,000 per family per year across 27,000+ empaneled hospitals.',
    'ನೋಂದಾಯಿತ ಸರ್ಕಾರಿ ಮತ್ತು ಖಾಸಗಿ ಆಸ್ಪತ್ರೆಗಳಲ್ಲಿ ವಾರ್ಷಿಕ ₹5 ಲಕ್ಷದವರೆಗೆ ಸಂಪೂರ್ಣ ಉಚಿತ ಒಳರೋಗಿ ಚಿಕಿತ್ಸೆ.',
    'Families listed in the socio-economic caste census (SECC 2011) rural deprivation criteria D1 to D7, or active state BPL health cardholders.',
    'SECC ಪಟ್ಟಿಯಲ್ಲಿರುವ ಗ್ರಾಮೀಣ ಬಡ ಕುಟುಂಬಗಳು ಮತ್ತು ಕರ್ನಾಟಕದ ಬಿಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ ಹೊಂದಿರುವ ನಾಗರಿಕರು.',
    'Aadhaar Card, Ration Card (BPL/Antyodaya), Active Mobile number.',
    'ಆಧಾರ್ ಕಾರ್ಡ್, ಬಿಪಿಎಲ್ ಪಡಿತರ ಚೀಟಿ, ಮೊಬೈಲ್ ಸಂಖ್ಯೆ.',
    'https://pmjay.gov.in/',
    'https://beneficiary.nha.gov.in/',
    '2026-10-21'
)
ON CONFLICT (scheme_code) DO UPDATE SET
    name = EXCLUDED.name,
    name_kn = EXCLUDED.name_kn,
    benefits = EXCLUDED.benefits,
    benefits_kn = EXCLUDED.benefits_kn,
    eligibility = EXCLUDED.eligibility,
    eligibility_kn = EXCLUDED.eligibility_kn,
    documents_required = EXCLUDED.documents_required,
    documents_required_kn = EXCLUDED.documents_required_kn,
    official_url = EXCLUDED.official_url,
    apply_url = EXCLUDED.apply_url,
    last_verified_date = EXCLUDED.last_verified_date,
    updated_at = NOW();
