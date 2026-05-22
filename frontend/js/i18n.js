/**
 * SecureRuralPay — Shared i18n Language System
 * Supports: English, हिंदी (Hindi), தமிழ் (Tamil), తెలుగు (Telugu)
 * Usage: Include this script, then call i18n.apply() on DOMContentLoaded
 *        All translatable elements get a data-i18n="key" attribute.
 */

const i18n = (() => {
    // ── Shared nav labels used on all pages ───────────────────────
    const NAV = {
        en: { home: 'Home', send: 'Send', link: 'Links', hist: 'History', admin: 'Admin', back: 'Back' },
        hi: { home: 'होम', send: 'भेजें', link: 'लिंक', hist: 'इतिहास', admin: 'एडमिन', back: 'वापस' },
        ta: { home: 'முகப்பு', send: 'அனுப்பு', link: 'இணைப்பு', hist: 'வரலாறு', admin: 'நிர்வாகி', back: 'திரும்பு' },
        te: { home: 'హోమ్', send: 'పంపు', link: 'లింక్', hist: 'చరిత్ర', admin: 'అడ్మిన్', back: 'తిరిగి' }
    };

    // ── All translations keyed by data-i18n value ─────────────────
    const TRANSLATIONS = {
        en: {
            // ── Shared ──
            'offline-msg': 'No internet — Working in safe offline mode',
            'nav-home': NAV.en.home, 'nav-send': NAV.en.send, 'nav-link': NAV.en.link,
            'nav-hist': NAV.en.hist, 'nav-admin': NAV.en.admin, 'nav-back': NAV.en.back,
            'lang-btn': '🌐 EN',

            // ── index.html ──
            'idx-hero-sub': 'Your money is always safe with AI protection',
            'idx-security': 'Your connection is secure and protected',
            'idx-alert': '⚠️ <strong>Security Tip:</strong> Never share your PIN or OTP with anyone — even bank staff!',
            'idx-menu-label': 'What do you want to do?',
            'idx-login': 'Login / Enter',
            'idx-send': 'Send Money',
            'idx-link': 'Check a Website Link',
            'idx-pdf': 'Check Bank Statement',
            'idx-history': 'My History',
            'idx-ai-title': 'AI Features Active',
            'idx-ai-fraud': 'Fraud Detection',
            'idx-ai-phishing': 'Phishing Protection',
            'idx-ai-offline': 'Offline AI',
            'idx-ai-pdf': 'PDF Scanner',

            // ── login.html ──
            'login-title': 'Secure Login',
            'login-phone-lbl': '📱 Your Phone Number',
            'login-phone-hint': 'Enter your 10-digit mobile number',
            'login-pin-lbl': '🔑 Your 4-digit PIN',
            'login-pin-hint': 'Any 4 numbers (e.g. 1234) — first time registers you automatically',
            'login-btn': 'LOGIN',
            'login-otp-title': 'Enter Your Code',
            'login-otp-sub': 'We sent a 6-digit code to your phone. Enter it below.',
            'login-otp-lbl': 'Enter the 6-digit code',
            'login-otp-btn': 'VERIFY CODE',
            'login-resend': 'Resend Code',

            // ── send-money.html — already handled inline ──

            // ── check-link.html ──
            'link-title': 'Check Website Link',
            'link-hero-head': 'Check a Website Link',
            'link-hero-sub': 'Did someone send you a link on WhatsApp or SMS? Check it <strong>before</strong> clicking! Our AI detects fake bank websites in seconds.',
            'link-lbl': '🔗 Paste the link here:',
            'link-hint': 'Copy the link and paste it in the box above',
            'link-btn': 'CHECK THIS LINK',
            'link-loading': 'Scanning link with AI...',
            'link-result-head': 'Scan Result',
            'link-safe-tip': '✅ This link looks safe. You can click it.',
            'link-warn-tip': '⚠️ This link looks suspicious. Be careful!',
            'link-danger-tip': '🚫 DANGER! This is a fake/phishing website. Do NOT click!',
            'link-check-another': 'Check Another Link',

            // ── check-pdf.html ──
            'pdf-title': 'Check Bank Statement',
            'pdf-hero-head': 'Check Your Bank Statement',
            'pdf-hero-sub': 'Upload your bank statement PDF. Our AI reads every payment and finds any fraud or suspicious transactions for you.',
            'pdf-upload-title': '📁 Upload Bank Statement',
            'pdf-upload-sub': 'Supports SBI, HDFC, ICICI, Axis, Canara PDFs',
            'pdf-tap': 'Tap here to choose your PDF file',
            'pdf-drag': 'Or drag and drop your bank statement here',
            'pdf-analyze-btn': 'SCAN FOR FRAUD',
            'pdf-loading': 'AI is reading your bank statement...',
            'pdf-result-head': 'Statement Analysis Result',
            'pdf-check-another': 'Check Another Statement',

            // ── history.html ──
            'hist-title': 'My History',
            'hist-total': 'Total Payments',
            'hist-fraud': 'Fraud Blocked',
            'hist-safe': 'Safe Payments',
            'hist-saved': 'Fraud Saved',
            'hist-tab-all': 'All',
            'hist-tab-safe': '✅ Safe',
            'hist-tab-warn': '⚠️ Checked',
            'hist-tab-fraud': '❌ Fraud',
            'hist-empty-title': 'No Transactions Yet',
            'hist-empty-sub': 'Your payment history will appear here',
            'hist-send-btn': '💸 Send a Payment',
            'hist-load-more': 'Load More Transactions',
        },

        hi: {
            'offline-msg': 'इंटरनेट नहीं — सुरक्षित ऑफलाइन मोड में काम कर रहा है',
            'nav-home': NAV.hi.home, 'nav-send': NAV.hi.send, 'nav-link': NAV.hi.link,
            'nav-hist': NAV.hi.hist, 'nav-admin': NAV.hi.admin, 'nav-back': NAV.hi.back,
            'lang-btn': '🌐 हिंदी',
            'idx-hero-sub': 'AI सुरक्षा के साथ आपका पैसा हमेशा सुरक्षित है',
            'idx-security': 'आपका कनेक्शन सुरक्षित है',
            'idx-alert': '⚠️ <strong>सुरक्षा सुझाव:</strong> अपना PIN या OTP किसी को भी न बताएं — बैंक कर्मचारी को भी नहीं!',
            'idx-menu-label': 'आप क्या करना चाहते हैं?',
            'idx-login': 'लॉगिन करें',
            'idx-send': 'पैसे भेजें',
            'idx-link': 'वेबसाइट लिंक जांचें',
            'idx-pdf': 'बैंक स्टेटमेंट जांचें',
            'idx-history': 'मेरा इतिहास',
            'idx-ai-title': 'AI सुविधाएं सक्रिय',
            'idx-ai-fraud': 'धोखाधड़ी पहचान',
            'idx-ai-phishing': 'फिशिंग सुरक्षा',
            'idx-ai-offline': 'ऑफलाइन AI',
            'idx-ai-pdf': 'PDF स्कैनर',
            'login-title': 'सुरक्षित लॉगिन',
            'login-phone-lbl': '📱 आपका फोन नंबर',
            'login-phone-hint': 'अपना 10 अंकों का मोबाइल नंबर डालें',
            'login-pin-lbl': '🔑 आपका 4-अंकों का PIN',
            'login-pin-hint': 'कोई भी 4 अंक डालें (जैसे 1234) — पहली बार स्वचालित रूप से पंजीकृत होगा',
            'login-btn': 'लॉगिन',
            'login-otp-title': 'अपना कोड डालें',
            'login-otp-sub': 'हमने आपके फोन पर 6 अंकों का कोड भेजा। नीचे दर्ज करें।',
            'login-otp-lbl': '6-अंकों का कोड डालें',
            'login-otp-btn': 'कोड सत्यापित करें',
            'login-resend': 'कोड फिर भेजें',
            'link-title': 'लिंक जांचें',
            'link-hero-head': 'वेबसाइट लिंक जांचें',
            'link-hero-sub': 'क्या किसी ने WhatsApp या SMS पर लिंक भेजा? क्लिक करने से <strong>पहले</strong> यहाँ जांचें!',
            'link-lbl': '🔗 यहाँ लिंक पेस्ट करें:',
            'link-hint': 'लिंक कॉपी करके ऊपर बॉक्स में पेस्ट करें',
            'link-btn': 'इस लिंक को जांचें',
            'link-loading': 'AI से लिंक स्कैन हो रहा है...',
            'link-result-head': 'जांच परिणाम',
            'link-safe-tip': '✅ यह लिंक सुरक्षित है।',
            'link-warn-tip': '⚠️ यह लिंक संदिग्ध है। सावधान रहें!',
            'link-danger-tip': '🚫 खतरा! यह नकली वेबसाइट है। क्लिक न करें!',
            'link-check-another': 'दूसरा लिंक जांचें',
            'pdf-title': 'बैंक स्टेटमेंट जांचें',
            'pdf-hero-head': 'अपना बैंक स्टेटमेंट जांचें',
            'pdf-hero-sub': 'अपनी बैंक स्टेटमेंट PDF अपलोड करें। AI हर लेनदेन पढ़ेगा और धोखाधड़ी ढूंढेगा।',
            'pdf-upload-title': '📁 बैंक स्टेटमेंट अपलोड करें',
            'pdf-upload-sub': 'SBI, HDFC, ICICI, Axis, Canara PDF समर्थित',
            'pdf-tap': 'अपनी PDF फ़ाइल चुनने के लिए यहाँ टैप करें',
            'pdf-drag': 'या अपनी बैंक स्टेटमेंट यहाँ खींचें',
            'pdf-analyze-btn': 'धोखाधड़ी के लिए स्कैन करें',
            'pdf-loading': 'AI आपकी बैंक स्टेटमेंट पढ़ रहा है...',
            'pdf-result-head': 'स्टेटमेंट विश्लेषण परिणाम',
            'pdf-check-another': 'दूसरा स्टेटमेंट जांचें',
            'hist-title': 'मेरा इतिहास',
            'hist-total': 'कुल भुगतान',
            'hist-fraud': 'धोखाधड़ी रोकी',
            'hist-safe': 'सुरक्षित भुगतान',
            'hist-saved': 'बचाई गई राशि',
            'hist-tab-all': 'सभी',
            'hist-tab-safe': '✅ सुरक्षित',
            'hist-tab-warn': '⚠️ जांचा गया',
            'hist-tab-fraud': '❌ धोखाधड़ी',
            'hist-empty-title': 'अभी कोई लेनदेन नहीं',
            'hist-empty-sub': 'आपका भुगतान इतिहास यहाँ दिखेगा',
            'hist-send-btn': '💸 पैसे भेजें',
            'hist-load-more': 'और लेनदेन देखें',
        },

        ta: {
            'offline-msg': 'இணையம் இல்லை — பாதுகாப்பான ஆஃப்லைன் பயன்முறையில் செயல்படுகிறது',
            'nav-home': NAV.ta.home, 'nav-send': NAV.ta.send, 'nav-link': NAV.ta.link,
            'nav-hist': NAV.ta.hist, 'nav-admin': NAV.ta.admin, 'nav-back': NAV.ta.back,
            'lang-btn': '🌐 தமிழ்',
            'idx-hero-sub': 'AI பாதுகாப்புடன் உங்கள் பணம் எப்போதும் பாதுகாப்பாக இருக்கும்',
            'idx-security': 'உங்கள் இணைப்பு பாதுகாப்பாக உள்ளது',
            'idx-alert': '⚠️ <strong>பாதுகாப்பு குறிப்பு:</strong> உங்கள் PIN அல்லது OTP யாரிடமும் பகிர வேண்டாம்!',
            'idx-menu-label': 'நீங்கள் என்ன செய்ய விரும்புகிறீர்கள்?',
            'idx-login': 'உள்நுழை',
            'idx-send': 'பணம் அனுப்பு',
            'idx-link': 'வலைதளம் சரிபார்',
            'idx-pdf': 'வங்கி அறிக்கை சரிபார்',
            'idx-history': 'என் வரலாறு',
            'idx-ai-title': 'AI அம்சங்கள் செயலில் உள்ளன',
            'idx-ai-fraud': 'மோசடி கண்டறிதல்',
            'idx-ai-phishing': 'ஃபிஷிங் பாதுகாப்பு',
            'idx-ai-offline': 'ஆஃப்லைன் AI',
            'idx-ai-pdf': 'PDF ஸ்கேனர்',
            'login-title': 'பாதுகாப்பான உள்நுழைவு',
            'login-phone-lbl': '📱 உங்கள் தொலைபேசி எண்',
            'login-phone-hint': 'உங்கள் 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்',
            'login-pin-lbl': '🔑 உங்கள் 4 இலக்க PIN',
            'login-pin-hint': 'எந்த 4 எண்களும் (எ.கா. 1234) — முதல் முறை தானாக பதிவு செய்யும்',
            'login-btn': 'உள்நுழை',
            'login-otp-title': 'உங்கள் குறியீட்டை உள்ளிடவும்',
            'login-otp-sub': 'நாங்கள் உங்கள் தொலைபேசிக்கு 6 இலக்க குறியீட்டை அனுப்பினோம்.',
            'login-otp-lbl': '6 இலக்க குறியீட்டை உள்ளிடவும்',
            'login-otp-btn': 'குறியீட்டை சரிபார்',
            'login-resend': 'குறியீட்டை மீண்டும் அனுப்பு',
            'link-title': 'இணைப்பு சரிபார்',
            'link-hero-head': 'வலைதளம் இணைப்பு சரிபார்',
            'link-hero-sub': 'WhatsApp அல்லது SMS இல் இணைப்பு வந்ததா? கிளிக் செய்வதற்கு <strong>முன்பு</strong> சரிபார்க்கவும்!',
            'link-lbl': '🔗 இணைப்பை இங்கே ஒட்டவும்:',
            'link-hint': 'இணைப்பை நகலெடுத்து மேலே பெட்டியில் ஒட்டவும்',
            'link-btn': 'இந்த இணைப்பை சரிபார்',
            'link-loading': 'AI மூலம் இணைப்பு ஸ்கேன் செய்யப்படுகிறது...',
            'link-result-head': 'சரிபார்ப்பு முடிவு',
            'link-safe-tip': '✅ இந்த இணைப்பு பாதுகாப்பானது.',
            'link-warn-tip': '⚠️ இந்த இணைப்பு சந்தேகமானது. கவனமாக இருங்கள்!',
            'link-danger-tip': '🚫 ஆபத்து! இது போலி வலைதளம். கிளிக் செய்யாதீர்கள்!',
            'link-check-another': 'மற்றொரு இணைப்பை சரிபார்',
            'pdf-title': 'வங்கி அறிக்கை சரிபார்',
            'pdf-hero-head': 'உங்கள் வங்கி அறிக்கையை சரிபார்க்கவும்',
            'pdf-hero-sub': 'வங்கி அறிக்கை PDF ஐ பதிவேற்றவும். AI ஒவ்வொரு கொடுப்பனவையும் படித்து மோசடியை கண்டுபிடிக்கும்.',
            'pdf-upload-title': '📁 வங்கி அறிக்கை பதிவேற்று',
            'pdf-upload-sub': 'SBI, HDFC, ICICI, Axis, Canara PDF ஆதரிக்கப்படுகிறது',
            'pdf-tap': 'உங்கள் PDF கோப்பை தேர்வு செய்ய இங்கே தட்டவும்',
            'pdf-drag': 'அல்லது உங்கள் வங்கி அறிக்கையை இங்கே இழுக்கவும்',
            'pdf-analyze-btn': 'மோசடிக்கு ஸ்கேன் செய்',
            'pdf-loading': 'AI உங்கள் வங்கி அறிக்கையை படிக்கிறது...',
            'pdf-result-head': 'அறிக்கை பகுப்பாய்வு முடிவு',
            'pdf-check-another': 'மற்றொரு அறிக்கையை சரிபார்',
            'hist-title': 'என் வரலாறு',
            'hist-total': 'மொத்த கொடுப்பனவுகள்',
            'hist-fraud': 'மோசடி தடுக்கப்பட்டது',
            'hist-safe': 'பாதுகாப்பான கொடுப்பனவுகள்',
            'hist-saved': 'மிச்சமான பணம்',
            'hist-tab-all': 'அனைத்தும்',
            'hist-tab-safe': '✅ பாதுகாப்பானது',
            'hist-tab-warn': '⚠️ சரிபார்க்கப்பட்டது',
            'hist-tab-fraud': '❌ மோசடி',
            'hist-empty-title': 'இன்னும் பரிவர்த்தனைகள் இல்லை',
            'hist-empty-sub': 'உங்கள் கொடுப்பனவு வரலாறு இங்கே தோன்றும்',
            'hist-send-btn': '💸 கொடுப்பனவு செய்',
            'hist-load-more': 'மேலும் பரிவர்த்தனைகள் காண்க',
        },

        te: {
            'offline-msg': 'ఇంటర్నెట్ లేదు — సురక్షిత ఆఫ్‌లైన్ మోడ్‌లో పని చేస్తోంది',
            'nav-home': NAV.te.home, 'nav-send': NAV.te.send, 'nav-link': NAV.te.link,
            'nav-hist': NAV.te.hist, 'nav-admin': NAV.te.admin, 'nav-back': NAV.te.back,
            'lang-btn': '🌐 తెలుగు',
            'idx-hero-sub': 'AI రక్షణతో మీ డబ్బు ఎప్పుడూ సురక్షితం',
            'idx-security': 'మీ కనెక్షన్ సురక్షితంగా ఉంది',
            'idx-alert': '⚠️ <strong>భద్రతా సూచన:</strong> మీ PIN లేదా OTP ఎవరికీ చెప్పవద్దు — బ్యాంక్ సిబ్బందికి కూడా!',
            'idx-menu-label': 'మీరు ఏమి చేయాలనుకుంటున్నారు?',
            'idx-login': 'లాగిన్',
            'idx-send': 'డబ్బు పంపు',
            'idx-link': 'వెబ్‌సైట్ లింక్ తనిఖీ',
            'idx-pdf': 'బ్యాంక్ స్టేట్‌మెంట్ తనిఖీ',
            'idx-history': 'నా చరిత్ర',
            'idx-ai-title': 'AI ఫీచర్లు చురుగ్గా ఉన్నాయి',
            'idx-ai-fraud': 'మోసం గుర్తింపు',
            'idx-ai-phishing': 'ఫిషింగ్ రక్షణ',
            'idx-ai-offline': 'ఆఫ్‌లైన్ AI',
            'idx-ai-pdf': 'PDF స్కానర్',
            'login-title': 'సురక్షిత లాగిన్',
            'login-phone-lbl': '📱 మీ ఫోన్ నంబర్',
            'login-phone-hint': 'మీ 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి',
            'login-pin-lbl': '🔑 మీ 4 అంకెల PIN',
            'login-pin-hint': 'ఏదైనా 4 అంకెలు (ఉదా. 1234) — మొదటిసారి స్వయంచాలకంగా నమోదు అవుతుంది',
            'login-btn': 'లాగిన్',
            'login-otp-title': 'మీ కోడ్ నమోదు చేయండి',
            'login-otp-sub': 'మేము మీ ఫోన్‌కు 6 అంకెల కోడ్ పంపాము. దిగువ నమోదు చేయండి.',
            'login-otp-lbl': '6 అంకెల కోడ్ నమోదు చేయండి',
            'login-otp-btn': 'కోడ్ ధృవీకరించు',
            'login-resend': 'కోడ్ మళ్ళీ పంపు',
            'link-title': 'లింక్ తనిఖీ',
            'link-hero-head': 'వెబ్‌సైట్ లింక్ తనిఖీ చేయండి',
            'link-hero-sub': 'WhatsApp లేదా SMS లో లింక్ వచ్చిందా? క్లిక్ చేయడానికి <strong>ముందు</strong> ఇక్కడ తనిఖీ చేయండి!',
            'link-lbl': '🔗 లింక్‌ను ఇక్కడ అతికించండి:',
            'link-hint': 'లింక్ కాపీ చేసి పైన బాక్స్‌లో అతికించండి',
            'link-btn': 'ఈ లింక్ తనిఖీ చేయి',
            'link-loading': 'AI తో లింక్ స్కాన్ చేస్తోంది...',
            'link-result-head': 'స్కాన్ ఫలితం',
            'link-safe-tip': '✅ ఈ లింక్ సురక్షితంగా ఉంది.',
            'link-warn-tip': '⚠️ ఈ లింక్ అనుమానాస్పదంగా ఉంది. జాగ్రత్తగా ఉండండి!',
            'link-danger-tip': '🚫 ప్రమాదం! ఇది నకిలీ వెబ్‌సైట్. క్లిక్ చేయవద్దు!',
            'link-check-another': 'మరో లింక్ తనిఖీ చేయి',
            'pdf-title': 'బ్యాంక్ స్టేట్‌మెంట్ తనిఖీ',
            'pdf-hero-head': 'మీ బ్యాంక్ స్టేట్‌మెంట్ తనిఖీ చేయండి',
            'pdf-hero-sub': 'మీ బ్యాంక్ స్టేట్‌మెంట్ PDF అప్‌లోడ్ చేయండి. AI ప్రతి చెల్లింపు చదివి మోసాన్ని కనుగొంటుంది.',
            'pdf-upload-title': '📁 బ్యాంక్ స్టేట్‌మెంట్ అప్‌లోడ్ చేయండి',
            'pdf-upload-sub': 'SBI, HDFC, ICICI, Axis, Canara PDF లు మద్దతు ఉన్నాయి',
            'pdf-tap': 'మీ PDF ఫైల్ ఎంచుకోవడానికి ఇక్కడ నొక్కండి',
            'pdf-drag': 'లేదా మీ బ్యాంక్ స్టేట్‌మెంట్‌ను ఇక్కడ లాగండి',
            'pdf-analyze-btn': 'మోసం కోసం స్కాన్ చేయి',
            'pdf-loading': 'AI మీ బ్యాంక్ స్టేట్‌మెంట్ చదువుతోంది...',
            'pdf-result-head': 'స్టేట్‌మెంట్ విశ్లేషణ ఫలితం',
            'pdf-check-another': 'మరో స్టేట్‌మెంట్ తనిఖీ చేయి',
            'hist-title': 'నా చరిత్ర',
            'hist-total': 'మొత్తం చెల్లింపులు',
            'hist-fraud': 'మోసం నిలిపివేయబడింది',
            'hist-safe': 'సురక్షిత చెల్లింపులు',
            'hist-saved': 'మోసం ఆదా',
            'hist-tab-all': 'అన్నీ',
            'hist-tab-safe': '✅ సురక్షితం',
            'hist-tab-warn': '⚠️ తనిఖీ చేయబడింది',
            'hist-tab-fraud': '❌ మోసం',
            'hist-empty-title': 'ఇంకా లావాదేవీలు లేవు',
            'hist-empty-sub': 'మీ చెల్లింపు చరిత్ర ఇక్కడ కనిపిస్తుంది',
            'hist-send-btn': '💸 చెల్లింపు పంపు',
            'hist-load-more': 'మరిన్ని లావాదేవీలు చూడు',
        }
    };

    // ── Language dropdown HTML injected into every topbar ─────────
    const DROPDOWN_HTML = `
        <div style="position:relative" id="i18n-lang-wrap">
            <button onclick="i18n.toggleMenu()" id="i18n-lang-btn"
                style="background:rgba(255,255,255,.18);border:none;color:#fff;font-weight:700;padding:7px 13px;border-radius:20px;cursor:pointer;font-size:0.88rem">
                🌐 EN
            </button>
            <div id="i18n-lang-menu" style="display:none;position:absolute;right:0;top:44px;background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:8px;box-shadow:0 8px 24px rgba(0,0,0,.18);z-index:9999;min-width:140px">
                <button onclick="i18n.set('en')"  class="i18n-menu-item" id="i18n-lm-en">🇬🇧 English</button>
                <button onclick="i18n.set('hi')"  class="i18n-menu-item" id="i18n-lm-hi">🇮🇳 हिंदी</button>
                <button onclick="i18n.set('ta')"  class="i18n-menu-item" id="i18n-lm-ta">🇮🇳 தமிழ்</button>
                <button onclick="i18n.set('te')"  class="i18n-menu-item" id="i18n-lm-te">🇮🇳 తెలుగు</button>
            </div>
        </div>`;

    const DROPDOWN_STYLE = `
        <style>
        .i18n-menu-item {
            display:block;width:100%;text-align:left;padding:9px 14px;
            background:none;border:none;border-radius:8px;font-size:0.9rem;
            font-weight:600;cursor:pointer;transition:background 0.15s;color:#111;
        }
        .i18n-menu-item:hover { background:#f3f4f6; }
        .i18n-menu-item.active { background:#dbeafe;color:#1d4ed8; }
        </style>`;

    let currentLang = 'en';

    function apply(lang) {
        lang = lang || localStorage.getItem('srp_lang') || 'en';
        const t = TRANSLATIONS[lang];
        if (!t) return;
        currentLang = lang;
        document.documentElement.lang = lang;

        // Apply all data-i18n elements
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) el.innerHTML = t[key];
        });

        // Update dropdown button label
        const btn = document.getElementById('i18n-lang-btn');
        if (btn) btn.textContent = t['lang-btn'] || '🌐';

        // Highlight active menu item
        ['en', 'hi', 'ta', 'te'].forEach(l => {
            const item = document.getElementById('i18n-lm-' + l);
            if (item) item.classList.toggle('active', l === lang);
        });

        localStorage.setItem('srp_lang', lang);
    }

    function set(lang) {
        apply(lang);
        const m = document.getElementById('i18n-lang-menu');
        if (m) m.style.display = 'none';
    }

    function toggleMenu() {
        const m = document.getElementById('i18n-lang-menu');
        if (m) m.style.display = m.style.display === 'none' ? 'block' : 'none';
    }

    function injectDropdown() {
        // Replace old lang-toggle buttons OR inject into topbar
        const oldBtn = document.querySelector('.lang-toggle');
        if (oldBtn) {
            oldBtn.outerHTML = DROPDOWN_HTML;
        } else {
            const topbar = document.querySelector('.topbar');
            if (topbar) topbar.insertAdjacentHTML('beforeend', DROPDOWN_HTML);
        }
        document.head.insertAdjacentHTML('beforeend', DROPDOWN_STYLE);

        // Close menu on outside click
        document.addEventListener('click', e => {
            if (!e.target.closest('#i18n-lang-wrap')) {
                const m = document.getElementById('i18n-lang-menu');
                if (m) m.style.display = 'none';
            }
        });
    }

    function init() {
        injectDropdown();
        apply(localStorage.getItem('srp_lang') || 'en');
    }

    // Also expose toggleLang as a stub so old onclick="toggleLang()" still works
    window.toggleLang = () => toggleMenu();

    return { apply, set, toggleMenu, init };
})();

// Auto-init on DOM ready
document.addEventListener('DOMContentLoaded', () => i18n.init());
