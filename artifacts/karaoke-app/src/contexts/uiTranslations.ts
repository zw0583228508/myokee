import { useLang, type SupportedLang } from "./LanguageContext";

export interface UITranslations {
  skipToContent: string;
  autoDetect: string;
  clickToEnableAudio: string;
  bg: Record<string, string> & {
    changeBackground: string;
    reRendering: string;
    applyNew: string;
    chooseBg: string;
  };
  share: {
    text: string;
    copied: string;
    copyLink: string;
    shareNative: string;
    closeMenu: string;
    shareApp: string;
  };
  status: {
    starting: string;
    waitingQueue: string;
    isolatingVocals: string;
    transcribing: string;
    awaitingReview: string;
    renderingVideo: string;
    complete: string;
    failed: string;
  };
  jobPage: {
    loading: string;
    notFound: string;
    notFoundDesc: string;
    backToStudio: string;
    backToGallery: string;
    noVocal: string;
    karaokeVideo: string;
    processingCharge: string;
    buyCreditsDownload: string;
    verifyingCharge: string;
    verifyingChargeDesc: string;
    chargeError: string;
    chargeErrorDesc: string;
    retry: string;
    insufficientCredits: string;
    insufficientCreditsDesc: string;
    buyCredits: string;
    singNowTitle: string;
    singNowDesc: string;
    start: string;
    buyCreditsTitle: string;
    buyCreditsDesc: string;
    buyNow: string;
    trackDetails: string;
    statusLabel: string;
    statusSuccess: string;
    wordsLabel: string;
    wordsTranscribed: string;
    costLabel: string;
    freeUnder40: string;
    creditsUsed: string;
    creditsUnit: string;
    lyricsTitle: string;
    noVocalDetected: string;
    stuck: string;
    stuckRetry: string;
    errorDetails: string;
    toastReviewTitle: string;
    toastReviewDesc: string;
    notifReviewTitle: string;
    notifReviewBody: string;
    toastDoneTitle: string;
    toastDoneDesc: string;
    notifDoneTitle: string;
    notifDoneBody: string;
    toastFreeTitle: string;
    toastFreeDesc: string;
    toastChargedTitle: (n: number) => string;
    toastChargedDesc: (balance: number) => string;
    toastChargeError: string;
    toastChargeErrorDesc: string;
  };
  transcript: {
    title: string;
    desc: string;
    reset: string;
    placeholder: string;
    words: string;
    edited: string;
    processing: string;
    confirmCreate: string;
    error: string;
  };
  sing: {
    readyToSing: string;
    description: string;
    startBtn: string;
    micVolume: string;
    backingVolume: string;
    vocalEffects: string;
    bass: string;
    mid: string;
    treble: string;
    reverbWet: string;
    reverbDecay: string;
    delayWet: string;
    delayTime: string;
    delayFeedback: string;
    resetDefaults: string;
    micUnavailable: string;
    hideVideo: string;
    showVideo: string;
    inBackground: string;
    clickToFinish: string;
    aiAnalyzing: string;
    aiAnalyzingDesc: string;
    points: string;
    pitchAccuracy: string;
    timing: string;
    stability: string;
    wordsLabel: string;
    melodyContour: string;
    expression: string;
    artistComparison: string;
    aiAnalysisDetail: string;
    styleMatch: string;
    challengeWin: (name: string) => string;
    challengeLose: (name: string) => string;
    yourScoreLabel: string;
    theirScoreLabel: string;
    bestMoment: string;
    mixCalibration: string;
    listenCalibrate: string;
    vocal: string;
    backing: string;
    syncVocal: string;
    fineTune: string;
    earlyVocal: string;
    lateVocal: string;
    resetDefault: (ms: number) => string;
    stopPreview: string;
    listenMix: string;
    mixingLabel: string;
    exportSettings: string;
    computing: string;
    exportSync: (ms: number) => string;
    processingRecording: string;
    downloadPerformance: string;
    savingCloud: string;
    savedCloud: string;
    cloudError: string;
    saveCloud: string;
    sending: string;
    shareLeaderboard: string;
    shareError: string;
    sharedLeaderboard: string;
    recordAgain: string;
    copiedResult: string;
    shareResult: string;
    challengeFriend: string;
    singAgain: string;
    challengerGotScore: (name: string, score: number) => string;
    canYouBeat: string;
    shareTextWithScore: (song: string, score: number) => string;
    shareTextNoScore: (song: string) => string;
    someoneDefault: string;
    leaderboardError: string;
  };
}

const he: UITranslations = {
  skipToContent: "דלג לתוכן הראשי",
  autoDetect: "זיהוי אוטומטי",
  clickToEnableAudio: "לחץ להפעלת שמע",
  bg: {
    aurora: "זוהר צפוני", neon_pulse: "ניאון", fire_storm: "סערת אש", ocean_deep: "אוקיינוס",
    galaxy: "גלקסיה", sunset_vibes: "שקיעה", matrix_rain: "מטריקס", electric_storm: "סערת ברקים",
    golden_luxury: "זהב יוקרתי", cherry_blossom: "פריחת דובדבן", cyber_punk: "סייבר-פאנק",
    changeBackground: "שינוי רקע", reRendering: "מרנדר מחדש...", applyNew: "החל רקע חדש", chooseBg: "🎨 בחר רקע לסרטון",
  },
  share: {
    text: "MYOUKEE — צור קריוקי AI מכל שיר תוך שניות! 🎤🎶",
    copied: "הועתק!", copyLink: "העתק קישור", shareNative: "שתף...",
    closeMenu: "סגור תפריט שיתוף", shareApp: "שתף את האפליקציה",
  },
  status: {
    starting: "מתחיל…", waitingQueue: "ממתין בתור", isolatingVocals: "מפריד ווקאל",
    transcribing: "מתמלל", awaitingReview: "ממתין לבדיקה", renderingVideo: "מרנדר וידאו",
    complete: "הושלם", failed: "נכשל",
  },
  jobPage: {
    loading: "טוען פרטי עבודה...", notFound: "העבודה לא נמצאה",
    notFoundDesc: "הטראק שאתה מחפש לא קיים או נמחק.",
    backToStudio: "חזרה לסטודיו", backToGallery: "חזרה לגלריה",
    noVocal: "ללא ווקאל", karaokeVideo: "וידאו קריוקי",
    processingCharge: "מעבד חיוב...", buyCreditsDownload: "קנה קרדיטים להורדה",
    verifyingCharge: "מאמת חיוב...", verifyingChargeDesc: "רגע, מעבדים את החיוב ומכינים את ההורדה.",
    chargeError: "שגיאה בעיבוד החיוב", chargeErrorDesc: "לא הצלחנו לעבד את החיוב. לחץ על \"נסה שוב\" כדי לנסות מחדש.",
    retry: "נסה שוב", insufficientCredits: "אין מספיק קרדיטים",
    insufficientCreditsDesc: "השיר עובד בהצלחה! כדי להוריד, נדרש לרכוש קרדיטים. חזור לדף הראשי וקנה חבילה.",
    buyCredits: "קנה קרדיטים", singNowTitle: "שר עכשיו", singNowDesc: "הקלט את עצמך שר על הקריוקי",
    start: "התחל", buyCreditsTitle: "רכישת קרדיטים", buyCreditsDesc: "עבד על שירים מלאים ללא הגבלת זמן",
    buyNow: "קנה עכשיו", trackDetails: "פרטי טראק", statusLabel: "סטטוס", statusSuccess: "עובד בהצלחה",
    wordsLabel: "מילים", wordsTranscribed: "מילים תומללו", costLabel: "עלות",
    freeUnder40: "חינם (עד 40 שניות)", creditsUsed: "קרדיטים שנוצלו", creditsUnit: "קרדיטים",
    lyricsTitle: "מילות השיר", noVocalDetected: "לא זוהה ווקאל בטראק זה.",
    stuck: "נראה שהעיבוד נתקע.", stuckRetry: "לחץ על \"נסה שוב\" כדי להפעיל מחדש.",
    errorDetails: "פרטי שגיאה:", toastReviewTitle: "✅ התמלול מוכן לבדיקה!",
    toastReviewDesc: "גלול למטה לבדיקת המילים",
    notifReviewTitle: "MYOUKEE — תמלול מוכן!", notifReviewBody: "לחץ לבדיקת המילים",
    toastDoneTitle: "🎤 הקריוקי מוכן!", toastDoneDesc: "ניתן לשיר עכשיו!",
    notifDoneTitle: "MYOUKEE — קריוקי מוכן! 🎤", notifDoneBody: "לחץ לשירה",
    toastFreeTitle: "שיר חינמי!", toastFreeDesc: "שיר קצר מ-40 שניות — ללא עלות.",
    toastChargedTitle: (n) => `נוצלו ${n} קרדיטים`,
    toastChargedDesc: (b) => `יתרה חדשה: ${b} קרדיטים`,
    toastChargeError: "שגיאה בחיוב", toastChargeErrorDesc: "לא הצלחנו לעבד את החיוב. נסה שוב.",
  },
  transcript: {
    title: "בדיקת תמלול", desc: "ערוך את הטקסט ישירות. שינויים בשמות/מילים ישמרו את התזמון המקורי.",
    reset: "איפוס", placeholder: "לא זוהה ווקאל בקובץ...",
    words: "מילים", edited: "נערך", processing: "מתחיל עיבוד…", confirmCreate: "אישור ויצירת וידאו",
    error: "שגיאה:",
  },
  sing: {
    readyToSing: "מוכן לשיר?", description: "MYOUKEE תפעיל את הפלייבק, תקשיב לקול שלך, תנתח בזמן אמת ותנתן ציון מפורט",
    startBtn: "התחל", micVolume: "עוצמת מיק", backingVolume: "עוצמת ליווי (אוזניות)",
    vocalEffects: "אפקטים קוליים", bass: "בס (Bass)", mid: "אמצע (Mid)", treble: "טרבל (Treble)",
    reverbWet: "עומק (Wet)", reverbDecay: "אורך (Decay)", delayWet: "עומק (Wet)",
    delayTime: "זמן (Time)", delayFeedback: "משוב (Feedback)", resetDefaults: "איפוס לברירת מחדל",
    micUnavailable: "מיקרופון לא זמין", hideVideo: "הסתר וידאו", showVideo: "הצג וידאו",
    inBackground: "ברקע", clickToFinish: "לחץ לסיים ולשמור",
    aiAnalyzing: "AI מנתח את הביצוע…", aiAnalyzingDesc: "ניתוח מתקדם: דיוק, תזמון, יציבות, ביטוי",
    points: "נקודות", pitchAccuracy: "דיוק צלילים", timing: "תזמון", stability: "יציבות",
    wordsLabel: "מילים", melodyContour: "קו מנגינה", expression: "ביטוי",
    artistComparison: "השוואה לאמן המקורי", aiAnalysisDetail: "ניתוח AI: דיוק, מנגינה, יציבות וביטוי",
    styleMatch: "התאמה לסגנון המקורי",
    challengeWin: (name) => `🏆 ניצחת את ${name}!`,
    challengeLose: (name) => `😤 ${name} עדיין מוביל...`,
    yourScoreLabel: "הציון שלך", theirScoreLabel: "שלהם",
    bestMoment: "הרגע הטוב ביותר שלך", mixCalibration: "כיול מיקס",
    listenCalibrate: "שמע + כייל לפני ייצוא", vocal: "🎤 קול", backing: "🎵 ליווי",
    syncVocal: "⏱ סנכרון קול", fineTune: "כיוון עדין", earlyVocal: "קול מוקדם ←", lateVocal: "→ קול מאוחר",
    resetDefault: (ms) => `איפוס לברירת מחדל (${ms}ms)`,
    stopPreview: "עצור תצוגה מקדימה", listenMix: "האזן למיקס", mixingLabel: "מייצר...",
    exportSettings: "ייצא עם הגדרות אלה", computing: "מחשב...",
    exportSync: (ms) => `ייצא עם תזמון ${ms > 0 ? '+' : ''}${ms}ms`,
    processingRecording: "מעבד הקלטה...", downloadPerformance: "הורד את הביצוע שלך (WAV)",
    savingCloud: "שומר בענן...", savedCloud: "נשמר בענן ✓",
    cloudError: "שגיאה — נסה שוב", saveCloud: "שמור בענן ☁️",
    sending: "שולח...", shareLeaderboard: "שתף בלידרבורד 🏆",
    shareError: "שגיאה בשיתוף — נסה שוב", sharedLeaderboard: "שותף בלידרבורד! ✓",
    recordAgain: "הקלט שוב 🎤", copiedResult: "הועתק! ✓", shareResult: "שתף תוצאה",
    challengeFriend: "אתגר חבר 🏆", singAgain: "שיר שוב",
    challengerGotScore: (name, score) => `${name} קיבל ציון ${score}`,
    canYouBeat: "האם תצליח להכות אותם?",
    shareTextWithScore: (song, score) => `שרתי "${song}" ב-MYOUKEE וקיבלתי ציון ${score}/100! 🎤 כמה תשיגו?`,
    shareTextNoScore: (song) => `הכנסתי "${song}" לקריוקי ב-MYOUKEE!`,
    someoneDefault: "מישהו", leaderboardError: "שגיאה בשיתוף ללידרבורד — נסה שוב",
  },
};

const en: UITranslations = {
  skipToContent: "Skip to main content",
  autoDetect: "Auto Detect",
  clickToEnableAudio: "Click to enable audio",
  bg: {
    aurora: "Aurora", neon_pulse: "Neon", fire_storm: "Fire Storm", ocean_deep: "Ocean",
    galaxy: "Galaxy", sunset_vibes: "Sunset", matrix_rain: "Matrix", electric_storm: "Lightning Storm",
    golden_luxury: "Golden Luxury", cherry_blossom: "Cherry Blossom", cyber_punk: "Cyberpunk",
    changeBackground: "Change Background", reRendering: "Re-rendering...", applyNew: "Apply New Background", chooseBg: "🎨 Choose Video Background",
  },
  share: {
    text: "MYOUKEE — Create AI karaoke from any song in seconds! 🎤🎶",
    copied: "Copied!", copyLink: "Copy Link", shareNative: "Share...",
    closeMenu: "Close share menu", shareApp: "Share App",
  },
  status: {
    starting: "Starting…", waitingQueue: "Waiting in Queue", isolatingVocals: "Isolating Vocals",
    transcribing: "Transcribing", awaitingReview: "Awaiting Review", renderingVideo: "Rendering Video",
    complete: "Complete", failed: "Failed",
  },
  jobPage: {
    loading: "Loading job details...", notFound: "Job Not Found",
    notFoundDesc: "The track you're looking for doesn't exist or was deleted.",
    backToStudio: "Back to Studio", backToGallery: "Back to Gallery",
    noVocal: "Instrumental", karaokeVideo: "Karaoke Video",
    processingCharge: "Processing charge...", buyCreditsDownload: "Buy Credits to Download",
    verifyingCharge: "Verifying charge...", verifyingChargeDesc: "One moment, processing the charge and preparing your download.",
    chargeError: "Charge Processing Error", chargeErrorDesc: "We couldn't process the charge. Click \"Retry\" to try again.",
    retry: "Retry", insufficientCredits: "Insufficient Credits",
    insufficientCreditsDesc: "The song was processed successfully! To download, you need to purchase credits. Go to the home page and buy a package.",
    buyCredits: "Buy Credits", singNowTitle: "Sing Now", singNowDesc: "Record yourself singing along to the karaoke",
    start: "Start", buyCreditsTitle: "Buy Credits", buyCreditsDesc: "Process full-length songs with no time limit",
    buyNow: "Buy Now", trackDetails: "Track Details", statusLabel: "Status", statusSuccess: "Completed Successfully",
    wordsLabel: "Words", wordsTranscribed: "words transcribed", costLabel: "Cost",
    freeUnder40: "Free (under 40 seconds)", creditsUsed: "Credits Used", creditsUnit: "credits",
    lyricsTitle: "Lyrics", noVocalDetected: "No vocal detected in this track.",
    stuck: "Processing seems stuck.", stuckRetry: "Click \"Retry\" to restart.",
    errorDetails: "Error details:", toastReviewTitle: "✅ Transcription ready for review!",
    toastReviewDesc: "Scroll down to check the lyrics",
    notifReviewTitle: "MYOUKEE — Transcription Ready!", notifReviewBody: "Click to review the lyrics",
    toastDoneTitle: "🎤 Karaoke is ready!", toastDoneDesc: "You can sing now!",
    notifDoneTitle: "MYOUKEE — Karaoke Ready! 🎤", notifDoneBody: "Click to sing",
    toastFreeTitle: "Free song!", toastFreeDesc: "Song under 40 seconds — no charge.",
    toastChargedTitle: (n) => `${n} credits used`,
    toastChargedDesc: (b) => `New balance: ${b} credits`,
    toastChargeError: "Charge error", toastChargeErrorDesc: "We couldn't process the charge. Please try again.",
  },
  transcript: {
    title: "Review Transcription", desc: "Edit the text directly. Changes to names/words will keep the original timing.",
    reset: "Reset", placeholder: "No vocal detected in file...",
    words: "words", edited: "edited", processing: "Starting processing…", confirmCreate: "Confirm & Create Video",
    error: "Error:",
  },
  sing: {
    readyToSing: "Ready to Sing?", description: "MYOUKEE will play the backing track, listen to your voice, analyze in real-time and give a detailed score",
    startBtn: "Start", micVolume: "Mic Volume", backingVolume: "Backing Volume (headphones)",
    vocalEffects: "Vocal Effects", bass: "Bass", mid: "Mid", treble: "Treble",
    reverbWet: "Depth (Wet)", reverbDecay: "Length (Decay)", delayWet: "Depth (Wet)",
    delayTime: "Time", delayFeedback: "Feedback", resetDefaults: "Reset to Defaults",
    micUnavailable: "Microphone unavailable", hideVideo: "Hide Video", showVideo: "Show Video",
    inBackground: "in background", clickToFinish: "Click to finish and save",
    aiAnalyzing: "AI is analyzing your performance…", aiAnalyzingDesc: "Advanced analysis: pitch, timing, stability, expression",
    points: "points", pitchAccuracy: "Pitch Accuracy", timing: "Timing", stability: "Stability",
    wordsLabel: "Words", melodyContour: "Melody Contour", expression: "Expression",
    artistComparison: "Comparison to Original Artist", aiAnalysisDetail: "AI Analysis: pitch, melody, stability and expression",
    styleMatch: "Match to original style",
    challengeWin: (name) => `🏆 You beat ${name}!`,
    challengeLose: (name) => `😤 ${name} still leads...`,
    yourScoreLabel: "Your score", theirScoreLabel: "theirs",
    bestMoment: "Your best moment", mixCalibration: "Mix Calibration",
    listenCalibrate: "Listen + calibrate before export", vocal: "🎤 Vocal", backing: "🎵 Backing",
    syncVocal: "⏱ Vocal Sync", fineTune: "Fine tune", earlyVocal: "Early vocal ←", lateVocal: "→ Late vocal",
    resetDefault: (ms) => `Reset to default (${ms}ms)`,
    stopPreview: "Stop Preview", listenMix: "Listen to Mix", mixingLabel: "Mixing...",
    exportSettings: "Export with these settings", computing: "Computing...",
    exportSync: (ms) => `Export with timing ${ms > 0 ? '+' : ''}${ms}ms`,
    processingRecording: "Processing recording...", downloadPerformance: "Download Your Performance (WAV)",
    savingCloud: "Saving to cloud...", savedCloud: "Saved to cloud ✓",
    cloudError: "Error — try again", saveCloud: "Save to Cloud ☁️",
    sending: "Sending...", shareLeaderboard: "Share to Leaderboard 🏆",
    shareError: "Sharing error — try again", sharedLeaderboard: "Shared to leaderboard! ✓",
    recordAgain: "Record Again 🎤", copiedResult: "Copied! ✓", shareResult: "Share Result",
    challengeFriend: "Challenge a Friend 🏆", singAgain: "Sing Again",
    challengerGotScore: (name, score) => `${name} scored ${score}`,
    canYouBeat: "Can you beat them?",
    shareTextWithScore: (song, score) => `I sang "${song}" on MYOUKEE and scored ${score}/100! 🎤 Can you beat me?`,
    shareTextNoScore: (song) => `I turned "${song}" into karaoke on MYOUKEE!`,
    someoneDefault: "Someone", leaderboardError: "Error sharing to leaderboard — try again",
  },
};

const ar: UITranslations = {
  skipToContent: "تخطي إلى المحتوى الرئيسي",
  autoDetect: "كشف تلقائي",
  clickToEnableAudio: "انقر لتشغيل الصوت",
  bg: {
    aurora: "شفق قطبي", neon_pulse: "نيون", fire_storm: "عاصفة نار", ocean_deep: "محيط",
    galaxy: "مجرة", sunset_vibes: "غروب", matrix_rain: "ماتريكس", electric_storm: "عاصفة برق",
    golden_luxury: "ذهب فاخر", cherry_blossom: "أزهار الكرز", cyber_punk: "سايبر بانك",
    changeBackground: "تغيير الخلفية", reRendering: "إعادة الإنشاء...", applyNew: "تطبيق خلفية جديدة", chooseBg: "🎨 اختر خلفية الفيديو",
  },
  share: {
    text: "MYOUKEE — أنشئ كاريوكي AI من أي أغنية في ثوانٍ! 🎤🎶",
    copied: "تم النسخ!", copyLink: "نسخ الرابط", shareNative: "مشاركة...",
    closeMenu: "إغلاق قائمة المشاركة", shareApp: "مشاركة التطبيق",
  },
  status: {
    starting: "جارٍ البدء…", waitingQueue: "في الانتظار", isolatingVocals: "فصل الصوت",
    transcribing: "نسخ النص", awaitingReview: "في انتظار المراجعة", renderingVideo: "إنشاء الفيديو",
    complete: "مكتمل", failed: "فشل",
  },
  jobPage: {
    loading: "جارٍ تحميل التفاصيل...", notFound: "لم يتم العثور على المهمة",
    notFoundDesc: "المقطع الذي تبحث عنه غير موجود أو تم حذفه.",
    backToStudio: "العودة للاستوديو", backToGallery: "العودة للمعرض",
    noVocal: "بدون صوت", karaokeVideo: "فيديو كاريوكي",
    processingCharge: "جارٍ معالجة الرسوم...", buyCreditsDownload: "اشترِ رصيداً للتحميل",
    verifyingCharge: "جارٍ التحقق من الرسوم...", verifyingChargeDesc: "لحظة، جارٍ معالجة الرسوم وتحضير التحميل.",
    chargeError: "خطأ في معالجة الرسوم", chargeErrorDesc: "لم نتمكن من معالجة الرسوم. انقر على \"إعادة المحاولة\".",
    retry: "إعادة المحاولة", insufficientCredits: "رصيد غير كافٍ",
    insufficientCreditsDesc: "تمت معالجة الأغنية بنجاح! للتحميل، تحتاج لشراء رصيد.",
    buyCredits: "شراء رصيد", singNowTitle: "غنِّ الآن", singNowDesc: "سجّل نفسك وأنت تغني الكاريوكي",
    start: "ابدأ", buyCreditsTitle: "شراء رصيد", buyCreditsDesc: "عالج أغانٍ كاملة بلا حد زمني",
    buyNow: "اشترِ الآن", trackDetails: "تفاصيل المقطع", statusLabel: "الحالة", statusSuccess: "تم بنجاح",
    wordsLabel: "كلمات", wordsTranscribed: "كلمة تم نسخها", costLabel: "التكلفة",
    freeUnder40: "مجاني (أقل من 40 ثانية)", creditsUsed: "الرصيد المستخدم", creditsUnit: "رصيد",
    lyricsTitle: "كلمات الأغنية", noVocalDetected: "لم يتم الكشف عن صوت في هذا المقطع.",
    stuck: "يبدو أن المعالجة توقفت.", stuckRetry: "انقر على \"إعادة المحاولة\" لإعادة التشغيل.",
    errorDetails: "تفاصيل الخطأ:", toastReviewTitle: "✅ النسخ جاهز للمراجعة!",
    toastReviewDesc: "مرر لأسفل لمراجعة الكلمات",
    notifReviewTitle: "MYOUKEE — النسخ جاهز!", notifReviewBody: "انقر لمراجعة الكلمات",
    toastDoneTitle: "🎤 الكاريوكي جاهز!", toastDoneDesc: "يمكنك الغناء الآن!",
    notifDoneTitle: "MYOUKEE — كاريوكي جاهز! 🎤", notifDoneBody: "انقر للغناء",
    toastFreeTitle: "أغنية مجانية!", toastFreeDesc: "أغنية أقل من 40 ثانية — بلا رسوم.",
    toastChargedTitle: (n) => `تم استخدام ${n} رصيد`,
    toastChargedDesc: (b) => `الرصيد الجديد: ${b} رصيد`,
    toastChargeError: "خطأ في الرسوم", toastChargeErrorDesc: "لم نتمكن من معالجة الرسوم. حاول مجدداً.",
  },
  transcript: {
    title: "مراجعة النسخ", desc: "عدّل النص مباشرة. التغييرات في الأسماء/الكلمات ستحتفظ بالتوقيت الأصلي.",
    reset: "إعادة تعيين", placeholder: "لم يتم الكشف عن صوت في الملف...",
    words: "كلمات", edited: "تم التعديل", processing: "بدء المعالجة…", confirmCreate: "تأكيد وإنشاء الفيديو",
    error: "خطأ:",
  },
  sing: {
    readyToSing: "مستعد للغناء؟", description: "MYOUKEE ستشغّل الموسيقى وتستمع لصوتك وتحلل في الوقت الحقيقي وتعطي نتيجة مفصّلة",
    startBtn: "ابدأ", micVolume: "مستوى المايك", backingVolume: "مستوى الموسيقى (سماعات)",
    vocalEffects: "تأثيرات صوتية", bass: "باس", mid: "وسط", treble: "تريبل",
    reverbWet: "عمق", reverbDecay: "طول", delayWet: "عمق",
    delayTime: "وقت", delayFeedback: "تغذية راجعة", resetDefaults: "إعادة للإعدادات الافتراضية",
    micUnavailable: "المايك غير متوفر", hideVideo: "إخفاء الفيديو", showVideo: "إظهار الفيديو",
    inBackground: "في الخلفية", clickToFinish: "انقر للإنهاء والحفظ",
    aiAnalyzing: "AI يحلل أداءك…", aiAnalyzingDesc: "تحليل متقدم: دقة، توقيت، استقرار، تعبير",
    points: "نقاط", pitchAccuracy: "دقة النغمة", timing: "التوقيت", stability: "الاستقرار",
    wordsLabel: "كلمات", melodyContour: "خط اللحن", expression: "التعبير",
    artistComparison: "مقارنة بالفنان الأصلي", aiAnalysisDetail: "تحليل AI: دقة، لحن، استقرار وتعبير",
    styleMatch: "تطابق مع الأسلوب الأصلي",
    challengeWin: (name) => `🏆 تغلبت على ${name}!`,
    challengeLose: (name) => `😤 ${name} لا يزال في المقدمة...`,
    yourScoreLabel: "نتيجتك", theirScoreLabel: "نتيجتهم",
    bestMoment: "أفضل لحظة لك", mixCalibration: "معايرة المزج",
    listenCalibrate: "استمع + عاير قبل التصدير", vocal: "🎤 صوت", backing: "🎵 موسيقى",
    syncVocal: "⏱ مزامنة الصوت", fineTune: "ضبط دقيق", earlyVocal: "صوت مبكر ←", lateVocal: "→ صوت متأخر",
    resetDefault: (ms) => `إعادة للافتراضي (${ms}ms)`,
    stopPreview: "إيقاف المعاينة", listenMix: "استمع للمزج", mixingLabel: "جارٍ المزج...",
    exportSettings: "تصدير بهذه الإعدادات", computing: "جارٍ الحساب...",
    exportSync: (ms) => `تصدير بتوقيت ${ms > 0 ? '+' : ''}${ms}ms`,
    processingRecording: "جارٍ معالجة التسجيل...", downloadPerformance: "تحميل أدائك (WAV)",
    savingCloud: "جارٍ الحفظ في السحابة...", savedCloud: "تم الحفظ في السحابة ✓",
    cloudError: "خطأ — حاول مجدداً", saveCloud: "حفظ في السحابة ☁️",
    sending: "جارٍ الإرسال...", shareLeaderboard: "شارك في لوحة المتصدرين 🏆",
    shareError: "خطأ في المشاركة — حاول مجدداً", sharedLeaderboard: "تمت المشاركة في المتصدرين! ✓",
    recordAgain: "سجّل مرة أخرى 🎤", copiedResult: "تم النسخ! ✓", shareResult: "شارك النتيجة",
    challengeFriend: "تحدَّ صديقاً 🏆", singAgain: "غنِّ مرة أخرى",
    challengerGotScore: (name, score) => `${name} حصل على ${score}`,
    canYouBeat: "هل يمكنك التغلب عليهم؟",
    shareTextWithScore: (song, score) => `غنيت "${song}" على MYOUKEE وحصلت على ${score}/100! 🎤 هل تستطيع التغلب عليّ؟`,
    shareTextNoScore: (song) => `حولت "${song}" إلى كاريوكي على MYOUKEE!`,
    someoneDefault: "شخص ما", leaderboardError: "خطأ في المشاركة — حاول مجدداً",
  },
};

const ru: UITranslations = {
  skipToContent: "Перейти к основному содержимому",
  autoDetect: "Автоопределение",
  bg: {
    aurora: "Северное сияние", neon_pulse: "Неон", fire_storm: "Огненный шторм", ocean_deep: "Океан",
    galaxy: "Галактика", sunset_vibes: "Закат", matrix_rain: "Матрица", electric_storm: "Гроза",
    golden_luxury: "Золотая роскошь", cherry_blossom: "Сакура", cyber_punk: "Киберпанк",
    changeBackground: "Сменить фон", reRendering: "Рендеринг...", applyNew: "Применить новый фон", chooseBg: "🎨 Выберите фон видео",
  },
  share: {
    text: "MYOUKEE — Создайте AI-караоке из любой песни за секунды! 🎤🎶",
    copied: "Скопировано!", copyLink: "Копировать ссылку", shareNative: "Поделиться...",
    closeMenu: "Закрыть меню", shareApp: "Поделиться приложением",
  },
  status: {
    starting: "Запуск…", waitingQueue: "В очереди", isolatingVocals: "Разделение вокала",
    transcribing: "Транскрипция", awaitingReview: "Ожидает проверки", renderingVideo: "Рендеринг видео",
    complete: "Готово", failed: "Ошибка",
  },
  jobPage: {
    loading: "Загрузка деталей...", notFound: "Задание не найдено",
    notFoundDesc: "Трек, который вы ищете, не существует или был удалён.",
    backToStudio: "Назад в студию", backToGallery: "Назад в галерею",
    noVocal: "Инструментал", karaokeVideo: "Караоке-видео",
    processingCharge: "Обработка оплаты...", buyCreditsDownload: "Купить кредиты для скачивания",
    verifyingCharge: "Проверка оплаты...", verifyingChargeDesc: "Секунду, обрабатываем оплату и готовим загрузку.",
    chargeError: "Ошибка обработки оплаты", chargeErrorDesc: "Не удалось обработать оплату. Нажмите \"Повторить\".",
    retry: "Повторить", insufficientCredits: "Недостаточно кредитов",
    insufficientCreditsDesc: "Песня обработана! Для скачивания необходимо приобрести кредиты.",
    buyCredits: "Купить кредиты", singNowTitle: "Петь сейчас", singNowDesc: "Запишите себя, подпевая караоке",
    start: "Начать", buyCreditsTitle: "Купить кредиты", buyCreditsDesc: "Обработка полных песен без ограничений",
    buyNow: "Купить", trackDetails: "Детали трека", statusLabel: "Статус", statusSuccess: "Успешно",
    wordsLabel: "Слова", wordsTranscribed: "слов распознано", costLabel: "Стоимость",
    freeUnder40: "Бесплатно (до 40 секунд)", creditsUsed: "Использовано кредитов", creditsUnit: "кредитов",
    lyricsTitle: "Текст песни", noVocalDetected: "Вокал в этом треке не обнаружен.",
    stuck: "Обработка, похоже, застряла.", stuckRetry: "Нажмите \"Повторить\" для перезапуска.",
    errorDetails: "Детали ошибки:", toastReviewTitle: "✅ Транскрипция готова к проверке!",
    toastReviewDesc: "Прокрутите вниз для проверки текста",
    notifReviewTitle: "MYOUKEE — Транскрипция готова!", notifReviewBody: "Нажмите для проверки текста",
    toastDoneTitle: "🎤 Караоке готово!", toastDoneDesc: "Можно петь!",
    notifDoneTitle: "MYOUKEE — Караоке готово! 🎤", notifDoneBody: "Нажмите, чтобы петь",
    toastFreeTitle: "Бесплатная песня!", toastFreeDesc: "Песня короче 40 секунд — бесплатно.",
    toastChargedTitle: (n) => `Использовано ${n} кредитов`,
    toastChargedDesc: (b) => `Новый баланс: ${b} кредитов`,
    toastChargeError: "Ошибка оплаты", toastChargeErrorDesc: "Не удалось обработать оплату. Попробуйте снова.",
  },
  transcript: {
    title: "Проверка транскрипции", desc: "Редактируйте текст напрямую. Изменения в словах сохранят оригинальный тайминг.",
    reset: "Сбросить", placeholder: "Вокал в файле не обнаружен...",
    words: "слов", edited: "изменено", processing: "Начинаем обработку…", confirmCreate: "Подтвердить и создать видео",
    error: "Ошибка:",
  },
  sing: {
    readyToSing: "Готовы петь?", description: "MYOUKEE воспроизведёт фонограмму, послушает ваш голос, проанализирует в реальном времени и даст подробную оценку",
    startBtn: "Начать", micVolume: "Громкость микрофона", backingVolume: "Громкость фонограммы (наушники)",
    vocalEffects: "Вокальные эффекты", bass: "Бас", mid: "Средние", treble: "Высокие",
    reverbWet: "Глубина", reverbDecay: "Длина", delayWet: "Глубина",
    delayTime: "Время", delayFeedback: "Обратная связь", resetDefaults: "Сбросить по умолчанию",
    micUnavailable: "Микрофон недоступен", hideVideo: "Скрыть видео", showVideo: "Показать видео",
    inBackground: "на фоне", clickToFinish: "Нажмите для завершения и сохранения",
    aiAnalyzing: "AI анализирует исполнение…", aiAnalyzingDesc: "Анализ: точность, тайминг, стабильность, выразительность",
    points: "баллов", pitchAccuracy: "Точность высоты", timing: "Тайминг", stability: "Стабильность",
    wordsLabel: "Слова", melodyContour: "Контур мелодии", expression: "Выразительность",
    artistComparison: "Сравнение с оригинальным артистом", aiAnalysisDetail: "AI-анализ: точность, мелодия, стабильность и выразительность",
    styleMatch: "Совпадение с оригинальным стилем",
    challengeWin: (name) => `🏆 Вы победили ${name}!`,
    challengeLose: (name) => `😤 ${name} всё ещё лидирует...`,
    yourScoreLabel: "Ваш счёт", theirScoreLabel: "их",
    bestMoment: "Ваш лучший момент", mixCalibration: "Калибровка микса",
    listenCalibrate: "Прослушайте и настройте перед экспортом", vocal: "🎤 Вокал", backing: "🎵 Фонограмма",
    syncVocal: "⏱ Синхр. вокала", fineTune: "Тонкая настройка", earlyVocal: "Раньше ←", lateVocal: "→ Позже",
    resetDefault: (ms) => `Сбросить по умолчанию (${ms}ms)`,
    stopPreview: "Остановить превью", listenMix: "Слушать микс", mixingLabel: "Сведение...",
    exportSettings: "Экспорт с этими настройками", computing: "Вычисление...",
    exportSync: (ms) => `Экспорт с таймингом ${ms > 0 ? '+' : ''}${ms}ms`,
    processingRecording: "Обработка записи...", downloadPerformance: "Скачать ваше исполнение (WAV)",
    savingCloud: "Сохранение в облако...", savedCloud: "Сохранено в облаке ✓",
    cloudError: "Ошибка — попробуйте снова", saveCloud: "Сохранить в облако ☁️",
    sending: "Отправка...", shareLeaderboard: "Поделиться в таблице лидеров 🏆",
    shareError: "Ошибка — попробуйте снова", sharedLeaderboard: "Опубликовано в таблице лидеров! ✓",
    recordAgain: "Записать ещё 🎤", copiedResult: "Скопировано! ✓", shareResult: "Поделиться результатом",
    challengeFriend: "Бросить вызов другу 🏆", singAgain: "Спеть ещё раз",
    challengerGotScore: (name, score) => `${name} набрал ${score}`,
    canYouBeat: "Сможете их обойти?",
    shareTextWithScore: (song, score) => `Спел "${song}" на MYOUKEE и набрал ${score}/100! 🎤 Сможете лучше?`,
    shareTextNoScore: (song) => `Превратил "${song}" в караоке на MYOUKEE!`,
    someoneDefault: "Кто-то", leaderboardError: "Ошибка при публикации — попробуйте снова",
  },
};

const es: UITranslations = {
  skipToContent: "Saltar al contenido principal",
  autoDetect: "Detección automática",
  bg: {
    aurora: "Aurora Boreal", neon_pulse: "Neón", fire_storm: "Tormenta de Fuego", ocean_deep: "Océano",
    galaxy: "Galaxia", sunset_vibes: "Atardecer", matrix_rain: "Matrix", electric_storm: "Tormenta Eléctrica",
    golden_luxury: "Oro de Lujo", cherry_blossom: "Flor de Cerezo", cyber_punk: "Cyberpunk",
    changeBackground: "Cambiar Fondo", reRendering: "Re-renderizando...", applyNew: "Aplicar Nuevo Fondo", chooseBg: "🎨 Elige fondo del video",
  },
  share: {
    text: "MYOUKEE — ¡Crea karaoke AI de cualquier canción en segundos! 🎤🎶",
    copied: "¡Copiado!", copyLink: "Copiar Enlace", shareNative: "Compartir...",
    closeMenu: "Cerrar menú", shareApp: "Compartir App",
  },
  status: {
    starting: "Iniciando…", waitingQueue: "En cola", isolatingVocals: "Aislando vocales",
    transcribing: "Transcribiendo", awaitingReview: "Esperando revisión", renderingVideo: "Renderizando video",
    complete: "Completado", failed: "Fallido",
  },
  jobPage: {
    loading: "Cargando detalles...", notFound: "Trabajo no encontrado",
    notFoundDesc: "La pista que buscas no existe o fue eliminada.",
    backToStudio: "Volver al Estudio", backToGallery: "Volver a la Galería",
    noVocal: "Instrumental", karaokeVideo: "Video Karaoke",
    processingCharge: "Procesando cobro...", buyCreditsDownload: "Comprar créditos para descargar",
    verifyingCharge: "Verificando cobro...", verifyingChargeDesc: "Un momento, procesando el cobro y preparando la descarga.",
    chargeError: "Error en el cobro", chargeErrorDesc: "No pudimos procesar el cobro. Haz clic en \"Reintentar\".",
    retry: "Reintentar", insufficientCredits: "Créditos insuficientes",
    insufficientCreditsDesc: "¡La canción se procesó! Para descargar, necesitas comprar créditos.",
    buyCredits: "Comprar créditos", singNowTitle: "Canta Ahora", singNowDesc: "Grábate cantando el karaoke",
    start: "Iniciar", buyCreditsTitle: "Comprar Créditos", buyCreditsDesc: "Procesa canciones completas sin límite de tiempo",
    buyNow: "Comprar", trackDetails: "Detalles de la Pista", statusLabel: "Estado", statusSuccess: "Completado exitosamente",
    wordsLabel: "Palabras", wordsTranscribed: "palabras transcritas", costLabel: "Costo",
    freeUnder40: "Gratis (menos de 40 segundos)", creditsUsed: "Créditos usados", creditsUnit: "créditos",
    lyricsTitle: "Letra de la Canción", noVocalDetected: "No se detectó vocal en esta pista.",
    stuck: "El procesamiento parece atascado.", stuckRetry: "Haz clic en \"Reintentar\" para reiniciar.",
    errorDetails: "Detalles del error:", toastReviewTitle: "✅ ¡Transcripción lista para revisión!",
    toastReviewDesc: "Desplázate para revisar la letra",
    notifReviewTitle: "MYOUKEE — ¡Transcripción lista!", notifReviewBody: "Haz clic para revisar la letra",
    toastDoneTitle: "🎤 ¡El karaoke está listo!", toastDoneDesc: "¡Ya puedes cantar!",
    notifDoneTitle: "MYOUKEE — ¡Karaoke listo! 🎤", notifDoneBody: "Haz clic para cantar",
    toastFreeTitle: "¡Canción gratis!", toastFreeDesc: "Canción menor a 40 segundos — sin costo.",
    toastChargedTitle: (n) => `${n} créditos usados`,
    toastChargedDesc: (b) => `Nuevo saldo: ${b} créditos`,
    toastChargeError: "Error de cobro", toastChargeErrorDesc: "No pudimos procesar el cobro. Intenta de nuevo.",
  },
  transcript: {
    title: "Revisar Transcripción", desc: "Edita el texto directamente. Los cambios en palabras mantendrán el timing original.",
    reset: "Restablecer", placeholder: "No se detectó vocal en el archivo...",
    words: "palabras", edited: "editado", processing: "Iniciando procesamiento…", confirmCreate: "Confirmar y Crear Video",
    error: "Error:",
  },
  sing: {
    readyToSing: "¿Listo para cantar?", description: "MYOUKEE reproducirá la pista, escuchará tu voz, analizará en tiempo real y dará una puntuación detallada",
    startBtn: "Iniciar", micVolume: "Volumen del micrófono", backingVolume: "Volumen de pista (auriculares)",
    vocalEffects: "Efectos vocales", bass: "Bajo", mid: "Medio", treble: "Agudo",
    reverbWet: "Profundidad", reverbDecay: "Duración", delayWet: "Profundidad",
    delayTime: "Tiempo", delayFeedback: "Retroalimentación", resetDefaults: "Restablecer valores",
    micUnavailable: "Micrófono no disponible", hideVideo: "Ocultar video", showVideo: "Mostrar video",
    inBackground: "de fondo", clickToFinish: "Clic para terminar y guardar",
    aiAnalyzing: "AI analizando tu interpretación…", aiAnalyzingDesc: "Análisis avanzado: tono, timing, estabilidad, expresión",
    points: "puntos", pitchAccuracy: "Precisión de tono", timing: "Timing", stability: "Estabilidad",
    wordsLabel: "Palabras", melodyContour: "Contorno melódico", expression: "Expresión",
    artistComparison: "Comparación con el artista original", aiAnalysisDetail: "Análisis AI: tono, melodía, estabilidad y expresión",
    styleMatch: "Coincidencia con estilo original",
    challengeWin: (name) => `🏆 ¡Venciste a ${name}!`,
    challengeLose: (name) => `😤 ${name} sigue liderando...`,
    yourScoreLabel: "Tu puntuación", theirScoreLabel: "la de ellos",
    bestMoment: "Tu mejor momento", mixCalibration: "Calibración de mezcla",
    listenCalibrate: "Escucha y calibra antes de exportar", vocal: "🎤 Voz", backing: "🎵 Pista",
    syncVocal: "⏱ Sincr. vocal", fineTune: "Ajuste fino", earlyVocal: "Voz temprana ←", lateVocal: "→ Voz tardía",
    resetDefault: (ms) => `Restablecer (${ms}ms)`,
    stopPreview: "Detener vista previa", listenMix: "Escuchar mezcla", mixingLabel: "Mezclando...",
    exportSettings: "Exportar con estas opciones", computing: "Calculando...",
    exportSync: (ms) => `Exportar con timing ${ms > 0 ? '+' : ''}${ms}ms`,
    processingRecording: "Procesando grabación...", downloadPerformance: "Descargar tu interpretación (WAV)",
    savingCloud: "Guardando en la nube...", savedCloud: "Guardado en la nube ✓",
    cloudError: "Error — intenta de nuevo", saveCloud: "Guardar en la nube ☁️",
    sending: "Enviando...", shareLeaderboard: "Compartir en Ranking 🏆",
    shareError: "Error al compartir — intenta de nuevo", sharedLeaderboard: "¡Compartido en ranking! ✓",
    recordAgain: "Grabar de nuevo 🎤", copiedResult: "¡Copiado! ✓", shareResult: "Compartir resultado",
    challengeFriend: "Retar a un amigo 🏆", singAgain: "Cantar de nuevo",
    challengerGotScore: (name, score) => `${name} obtuvo ${score}`,
    canYouBeat: "¿Puedes superarlos?",
    shareTextWithScore: (song, score) => `Canté "${song}" en MYOUKEE y obtuve ${score}/100! 🎤 ¿Puedes superarme?`,
    shareTextNoScore: (song) => `Convertí "${song}" en karaoke en MYOUKEE!`,
    someoneDefault: "Alguien", leaderboardError: "Error al compartir — intenta de nuevo",
  },
};

function cloneWithLang(base: UITranslations, overrides: Partial<UITranslations>): UITranslations {
  return { ...base, ...overrides, bg: { ...base.bg, ...overrides.bg }, share: { ...base.share, ...overrides.share }, status: { ...base.status, ...overrides.status }, jobPage: { ...base.jobPage, ...overrides.jobPage }, transcript: { ...base.transcript, ...overrides.transcript }, sing: { ...base.sing, ...overrides.sing } } as UITranslations;
}

const fr: UITranslations = cloneWithLang(en, {
  skipToContent: "Aller au contenu principal", autoDetect: "Détection automatique",
  bg: {
    aurora: "Aurore boréale", neon_pulse: "Néon", fire_storm: "Tempête de feu", ocean_deep: "Océan",
    galaxy: "Galaxie", sunset_vibes: "Coucher de soleil", matrix_rain: "Matrix", electric_storm: "Tempête d'éclairs",
    golden_luxury: "Or luxueux", cherry_blossom: "Fleur de cerisier", cyber_punk: "Cyberpunk",
    changeBackground: "Changer le fond", reRendering: "Re-rendu...", applyNew: "Appliquer le nouveau fond", chooseBg: "🎨 Choisir le fond vidéo",
  },
  share: { text: "MYOUKEE — Créez du karaoké IA à partir de n'importe quelle chanson en secondes ! 🎤🎶", copied: "Copié !", copyLink: "Copier le lien", shareNative: "Partager...", closeMenu: "Fermer le menu", shareApp: "Partager l'appli" },
  status: { starting: "Démarrage…", waitingQueue: "En file d'attente", isolatingVocals: "Isolation des voix", transcribing: "Transcription", awaitingReview: "En attente de vérification", renderingVideo: "Rendu vidéo", complete: "Terminé", failed: "Échoué" },
  jobPage: { ...en.jobPage, loading: "Chargement des détails...", notFound: "Tâche non trouvée", notFoundDesc: "La piste recherchée n'existe pas ou a été supprimée.", backToStudio: "Retour au studio", backToGallery: "Retour à la galerie", noVocal: "Instrumental", karaokeVideo: "Vidéo karaoké", processingCharge: "Traitement du paiement...", retry: "Réessayer", insufficientCredits: "Crédits insuffisants", buyCredits: "Acheter des crédits", singNowTitle: "Chanter maintenant", singNowDesc: "Enregistrez-vous en chantant le karaoké", start: "Commencer", trackDetails: "Détails de la piste", statusLabel: "Statut", statusSuccess: "Traitement réussi", wordsLabel: "Mots", wordsTranscribed: "mots transcrits", lyricsTitle: "Paroles", noVocalDetected: "Aucune voix détectée dans cette piste.", toastDoneTitle: "🎤 Le karaoké est prêt !", toastDoneDesc: "Vous pouvez chanter maintenant !", toastFreeTitle: "Chanson gratuite !", toastFreeDesc: "Chanson de moins de 40 secondes — gratuit.", toastChargedTitle: (n) => `${n} crédits utilisés`, toastChargedDesc: (b) => `Nouveau solde : ${b} crédits`, toastChargeError: "Erreur de paiement", toastChargeErrorDesc: "Impossible de traiter le paiement. Réessayez." },
  transcript: { title: "Vérifier la transcription", desc: "Modifiez le texte directement. Les modifications conserveront le timing original.", reset: "Réinitialiser", placeholder: "Aucune voix détectée dans le fichier...", words: "mots", edited: "modifié", processing: "Démarrage du traitement…", confirmCreate: "Confirmer et créer la vidéo", error: "Erreur :" },
  sing: { ...en.sing, readyToSing: "Prêt à chanter ?", description: "MYOUKEE jouera la piste, écoutera votre voix, analysera en temps réel et donnera un score détaillé", startBtn: "Commencer", micVolume: "Volume du micro", backingVolume: "Volume d'accompagnement (casque)", vocalEffects: "Effets vocaux", resetDefaults: "Réinitialiser", micUnavailable: "Micro non disponible", hideVideo: "Masquer la vidéo", showVideo: "Afficher la vidéo", inBackground: "en arrière-plan", clickToFinish: "Cliquez pour terminer et sauvegarder", aiAnalyzing: "L'IA analyse votre performance…", points: "points", pitchAccuracy: "Précision tonale", timing: "Timing", stability: "Stabilité", wordsLabel: "Mots", expression: "Expression", artistComparison: "Comparaison avec l'artiste original", bestMoment: "Votre meilleur moment", mixCalibration: "Calibration du mix", vocal: "🎤 Voix", backing: "🎵 Accompagnement", processingRecording: "Traitement de l'enregistrement...", downloadPerformance: "Télécharger votre performance (WAV)", shareLeaderboard: "Partager au classement 🏆", recordAgain: "Enregistrer à nouveau 🎤", shareResult: "Partager le résultat", challengeFriend: "Défier un ami 🏆", singAgain: "Chanter à nouveau", challengeWin: (name) => `🏆 Vous avez battu ${name} !`, challengeLose: (name) => `😤 ${name} est encore en tête...`, shareTextWithScore: (song, score) => `J'ai chanté "${song}" sur MYOUKEE et obtenu ${score}/100 ! 🎤 Pouvez-vous faire mieux ?`, shareTextNoScore: (song) => `J'ai transformé "${song}" en karaoké sur MYOUKEE !`, someoneDefault: "Quelqu'un" },
});

const de: UITranslations = cloneWithLang(en, {
  skipToContent: "Zum Hauptinhalt springen", autoDetect: "Automatische Erkennung",
  bg: { aurora: "Nordlicht", neon_pulse: "Neon", fire_storm: "Feuersturm", ocean_deep: "Ozean", galaxy: "Galaxie", sunset_vibes: "Sonnenuntergang", matrix_rain: "Matrix", electric_storm: "Blitzsturm", golden_luxury: "Goldener Luxus", cherry_blossom: "Kirschblüte", cyber_punk: "Cyberpunk", changeBackground: "Hintergrund ändern", reRendering: "Wird neu gerendert...", applyNew: "Neuen Hintergrund anwenden", chooseBg: "🎨 Videohintergrund wählen" },
  share: { text: "MYOUKEE — Erstelle KI-Karaoke aus jedem Song in Sekunden! 🎤🎶", copied: "Kopiert!", copyLink: "Link kopieren", shareNative: "Teilen...", closeMenu: "Menü schließen", shareApp: "App teilen" },
  status: { starting: "Wird gestartet…", waitingQueue: "In der Warteschlange", isolatingVocals: "Gesang isolieren", transcribing: "Transkription", awaitingReview: "Wartet auf Überprüfung", renderingVideo: "Video wird gerendert", complete: "Fertig", failed: "Fehlgeschlagen" },
  jobPage: { ...en.jobPage, loading: "Lade Details...", notFound: "Auftrag nicht gefunden", notFoundDesc: "Der gesuchte Track existiert nicht oder wurde gelöscht.", backToStudio: "Zurück zum Studio", backToGallery: "Zurück zur Galerie", noVocal: "Instrumental", karaokeVideo: "Karaoke-Video", retry: "Wiederholen", buyCredits: "Credits kaufen", singNowTitle: "Jetzt singen", singNowDesc: "Nimm dich auf, wie du zum Karaoke singst", start: "Starten", trackDetails: "Track-Details", statusLabel: "Status", statusSuccess: "Erfolgreich", wordsLabel: "Wörter", wordsTranscribed: "Wörter transkribiert", lyricsTitle: "Liedtext", noVocalDetected: "Kein Gesang in diesem Track erkannt.", toastDoneTitle: "🎤 Karaoke ist fertig!", toastDoneDesc: "Du kannst jetzt singen!", toastChargedTitle: (n) => `${n} Credits verwendet`, toastChargedDesc: (b) => `Neuer Kontostand: ${b} Credits` },
  transcript: { title: "Transkription prüfen", desc: "Bearbeite den Text direkt. Änderungen an Wörtern behalten das Original-Timing.", reset: "Zurücksetzen", placeholder: "Kein Gesang in der Datei erkannt...", words: "Wörter", edited: "bearbeitet", processing: "Starte Verarbeitung…", confirmCreate: "Bestätigen & Video erstellen", error: "Fehler:" },
  sing: { ...en.sing, readyToSing: "Bereit zu singen?", description: "MYOUKEE spielt die Begleitung, hört deiner Stimme zu, analysiert in Echtzeit und gibt eine detaillierte Bewertung", startBtn: "Starten", micVolume: "Mikrofonlautstärke", backingVolume: "Begleitlautstärke (Kopfhörer)", vocalEffects: "Stimmeffekte", resetDefaults: "Auf Standard zurücksetzen", micUnavailable: "Mikrofon nicht verfügbar", points: "Punkte", pitchAccuracy: "Tongenauigkeit", timing: "Timing", stability: "Stabilität", wordsLabel: "Wörter", expression: "Ausdruck", artistComparison: "Vergleich mit Originalkünstler", bestMoment: "Dein bester Moment", recordAgain: "Nochmal aufnehmen 🎤", shareResult: "Ergebnis teilen", challengeFriend: "Freund herausfordern 🏆", singAgain: "Nochmal singen", challengeWin: (name) => `🏆 Du hast ${name} geschlagen!`, challengeLose: (name) => `😤 ${name} führt noch...`, shareTextWithScore: (song, score) => `Ich habe "${song}" auf MYOUKEE gesungen und ${score}/100 erreicht! 🎤 Kannst du mich schlagen?`, shareTextNoScore: (song) => `Ich habe "${song}" auf MYOUKEE in Karaoke verwandelt!`, someoneDefault: "Jemand" },
});

const ja: UITranslations = cloneWithLang(en, {
  skipToContent: "メインコンテンツへスキップ", autoDetect: "自動検出",
  bg: { aurora: "オーロラ", neon_pulse: "ネオン", fire_storm: "ファイアストーム", ocean_deep: "オーシャン", galaxy: "ギャラクシー", sunset_vibes: "サンセット", matrix_rain: "マトリックス", electric_storm: "雷嵐", golden_luxury: "ゴールドラグジュアリー", cherry_blossom: "桜", cyber_punk: "サイバーパンク", changeBackground: "背景を変更", reRendering: "再レンダリング中...", applyNew: "新しい背景を適用", chooseBg: "🎨 動画の背景を選択" },
  share: { text: "MYOUKEE — どんな曲からでもAIカラオケを数秒で作成！🎤🎶", copied: "コピーしました！", copyLink: "リンクをコピー", shareNative: "共有...", closeMenu: "メニューを閉じる", shareApp: "アプリを共有" },
  status: { starting: "開始中…", waitingQueue: "キューで待機中", isolatingVocals: "ボーカル分離中", transcribing: "文字起こし中", awaitingReview: "レビュー待ち", renderingVideo: "動画レンダリング中", complete: "完了", failed: "失敗" },
  jobPage: { ...en.jobPage, loading: "詳細を読み込み中...", notFound: "ジョブが見つかりません", notFoundDesc: "お探しのトラックは存在しないか、削除されました。", backToStudio: "スタジオに戻る", backToGallery: "ギャラリーに戻る", noVocal: "インストゥルメンタル", karaokeVideo: "カラオケ動画", retry: "再試行", buyCredits: "クレジットを購入", singNowTitle: "今すぐ歌う", start: "開始", trackDetails: "トラック詳細", statusLabel: "ステータス", statusSuccess: "正常に完了", wordsLabel: "単語", wordsTranscribed: "語を認識", lyricsTitle: "歌詞", noVocalDetected: "このトラックでボーカルは検出されませんでした。", toastDoneTitle: "🎤 カラオケの準備ができました！", toastDoneDesc: "歌えます！", toastChargedTitle: (n) => `${n}クレジット使用`, toastChargedDesc: (b) => `新しい残高: ${b}クレジット` },
  transcript: { title: "文字起こしを確認", desc: "テキストを直接編集できます。単語の変更は元のタイミングを維持します。", reset: "リセット", placeholder: "ファイルにボーカルが検出されません...", words: "語", edited: "編集済み", processing: "処理を開始中…", confirmCreate: "確認して動画を作成", error: "エラー:" },
  sing: { ...en.sing, readyToSing: "歌う準備はできましたか？", startBtn: "開始", micVolume: "マイク音量", backingVolume: "伴奏音量（ヘッドフォン）", vocalEffects: "ボーカルエフェクト", resetDefaults: "デフォルトにリセット", micUnavailable: "マイクが利用できません", points: "ポイント", pitchAccuracy: "音程の正確さ", timing: "タイミング", stability: "安定性", wordsLabel: "歌詞", expression: "表現力", artistComparison: "オリジナルアーティストとの比較", bestMoment: "ベストモーメント", recordAgain: "もう一度録音 🎤", shareResult: "結果を共有", challengeFriend: "友達に挑戦 🏆", singAgain: "もう一度歌う", challengeWin: (name) => `🏆 ${name}に勝ちました！`, challengeLose: (name) => `😤 ${name}がまだリード中...`, shareTextWithScore: (song, score) => `MYOUKEEで「${song}」を歌って${score}/100を獲得！🎤 あなたは何点取れる？`, shareTextNoScore: (song) => `MYOUKEEで「${song}」をカラオケにしました！`, someoneDefault: "誰か" },
});

const zh: UITranslations = cloneWithLang(en, {
  skipToContent: "跳到主要内容", autoDetect: "自动检测",
  bg: { aurora: "极光", neon_pulse: "霓虹", fire_storm: "火焰风暴", ocean_deep: "海洋", galaxy: "银河", sunset_vibes: "日落", matrix_rain: "矩阵", electric_storm: "闪电风暴", golden_luxury: "金色奢华", cherry_blossom: "樱花", cyber_punk: "赛博朋克", changeBackground: "更改背景", reRendering: "重新渲染中...", applyNew: "应用新背景", chooseBg: "🎨 选择视频背景" },
  share: { text: "MYOUKEE — 几秒内将任何歌曲变成AI卡拉OK！🎤🎶", copied: "已复制！", copyLink: "复制链接", shareNative: "分享...", closeMenu: "关闭菜单", shareApp: "分享应用" },
  status: { starting: "启动中…", waitingQueue: "排队等待中", isolatingVocals: "人声分离中", transcribing: "转录中", awaitingReview: "等待审核", renderingVideo: "渲染视频中", complete: "完成", failed: "失败" },
  jobPage: { ...en.jobPage, loading: "加载详情...", notFound: "未找到任务", notFoundDesc: "您搜索的曲目不存在或已被删除。", backToStudio: "返回工作室", backToGallery: "返回画廊", noVocal: "伴奏", karaokeVideo: "卡拉OK视频", retry: "重试", buyCredits: "购买额度", singNowTitle: "立即演唱", start: "开始", trackDetails: "曲目详情", statusLabel: "状态", statusSuccess: "处理成功", wordsLabel: "词", wordsTranscribed: "个词已转录", lyricsTitle: "歌词", noVocalDetected: "此曲目未检测到人声。", toastDoneTitle: "🎤 卡拉OK准备就绪！", toastDoneDesc: "可以开始演唱了！", toastChargedTitle: (n) => `已使用${n}额度`, toastChargedDesc: (b) => `新余额：${b}额度` },
  transcript: { title: "检查转录", desc: "直接编辑文本。修改词语将保留原始时间。", reset: "重置", placeholder: "文件中未检测到人声...", words: "词", edited: "已编辑", processing: "开始处理…", confirmCreate: "确认并创建视频", error: "错误：" },
  sing: { ...en.sing, readyToSing: "准备好唱了吗？", startBtn: "开始", micVolume: "麦克风音量", backingVolume: "伴奏音量（耳机）", vocalEffects: "人声效果", resetDefaults: "重置为默认", micUnavailable: "麦克风不可用", points: "分", pitchAccuracy: "音准", timing: "节奏", stability: "稳定性", wordsLabel: "歌词", expression: "表现力", artistComparison: "与原唱的比较", bestMoment: "你的最佳时刻", recordAgain: "再次录制 🎤", shareResult: "分享结果", challengeFriend: "挑战好友 🏆", singAgain: "再唱一次", challengeWin: (name) => `🏆 你击败了${name}！`, challengeLose: (name) => `😤 ${name}仍然领先...`, shareTextWithScore: (song, score) => `我在MYOUKEE上唱了"${song}"，获得了${score}/100分！🎤 你能超过我吗？`, shareTextNoScore: (song) => `我在MYOUKEE上将"${song}"变成了卡拉OK！`, someoneDefault: "某人" },
});

const ko: UITranslations = cloneWithLang(en, {
  skipToContent: "메인 콘텐츠로 건너뛰기", autoDetect: "자동 감지",
  bg: { aurora: "오로라", neon_pulse: "네온", fire_storm: "불꽃 폭풍", ocean_deep: "바다", galaxy: "은하", sunset_vibes: "석양", matrix_rain: "매트릭스", electric_storm: "번개 폭풍", golden_luxury: "골드 럭셔리", cherry_blossom: "벚꽃", cyber_punk: "사이버펑크", changeBackground: "배경 변경", reRendering: "다시 렌더링 중...", applyNew: "새 배경 적용", chooseBg: "🎨 영상 배경 선택" },
  share: { text: "MYOUKEE — 몇 초 만에 AI 노래방을 만들어보세요! 🎤🎶", copied: "복사됨!", copyLink: "링크 복사", shareNative: "공유...", closeMenu: "메뉴 닫기", shareApp: "앱 공유" },
  status: { starting: "시작 중…", waitingQueue: "대기 중", isolatingVocals: "보컬 분리 중", transcribing: "가사 인식 중", awaitingReview: "검토 대기 중", renderingVideo: "영상 렌더링 중", complete: "완료", failed: "실패" },
  jobPage: { ...en.jobPage, loading: "상세 정보 로딩 중...", notFound: "작업을 찾을 수 없음", backToStudio: "스튜디오로 돌아가기", backToGallery: "갤러리로 돌아가기", noVocal: "MR", karaokeVideo: "노래방 영상", retry: "재시도", buyCredits: "크레딧 구매", singNowTitle: "지금 부르기", start: "시작", trackDetails: "트랙 상세", statusLabel: "상태", statusSuccess: "처리 성공", wordsLabel: "단어", wordsTranscribed: "단어 인식됨", lyricsTitle: "가사", noVocalDetected: "이 트랙에서 보컬이 감지되지 않았습니다.", toastDoneTitle: "🎤 노래방 준비 완료!", toastDoneDesc: "지금 노래할 수 있어요!", toastChargedTitle: (n) => `${n} 크레딧 사용`, toastChargedDesc: (b) => `새 잔액: ${b} 크레딧` },
  transcript: { title: "가사 확인", desc: "텍스트를 직접 편집하세요. 변경 사항은 원래 타이밍을 유지합니다.", reset: "초기화", placeholder: "파일에서 보컬이 감지되지 않음...", words: "단어", edited: "편집됨", processing: "처리 시작 중…", confirmCreate: "확인 후 영상 생성", error: "오류:" },
  sing: { ...en.sing, readyToSing: "노래할 준비 됐나요?", startBtn: "시작", micVolume: "마이크 볼륨", backingVolume: "반주 볼륨 (이어폰)", vocalEffects: "보컬 효과", resetDefaults: "기본값으로 초기화", micUnavailable: "마이크 사용 불가", points: "점", pitchAccuracy: "음정 정확도", timing: "타이밍", stability: "안정성", wordsLabel: "가사", expression: "표현력", artistComparison: "원곡 아티스트와 비교", bestMoment: "최고의 순간", recordAgain: "다시 녹음 🎤", shareResult: "결과 공유", challengeFriend: "친구에게 도전 🏆", singAgain: "다시 부르기", challengeWin: (name) => `🏆 ${name}을(를) 이겼습니다!`, challengeLose: (name) => `😤 ${name}이(가) 아직 앞서고 있습니다...`, shareTextWithScore: (song, score) => `MYOUKEE에서 "${song}"을(를) 부르고 ${score}/100점을 받았어요! 🎤 이길 수 있나요?`, shareTextNoScore: (song) => `MYOUKEE에서 "${song}"을(를) 노래방으로 만들었어요!`, someoneDefault: "누군가" },
});

const th: UITranslations = cloneWithLang(en, {
  skipToContent: "ข้ามไปยังเนื้อหาหลัก", autoDetect: "ตรวจจับอัตโนมัติ",
  bg: { aurora: "แสงเหนือ", neon_pulse: "นีออน", fire_storm: "พายุไฟ", ocean_deep: "มหาสมุทร", galaxy: "กาแล็กซี่", sunset_vibes: "พระอาทิตย์ตก", matrix_rain: "เมทริกซ์", electric_storm: "พายุฟ้าผ่า", golden_luxury: "ทองคำหรูหรา", cherry_blossom: "ดอกซากุระ", cyber_punk: "ไซเบอร์พังก์", changeBackground: "เปลี่ยนพื้นหลัง", reRendering: "กำลังเรนเดอร์ใหม่...", applyNew: "ใช้พื้นหลังใหม่", chooseBg: "🎨 เลือกพื้นหลังวิดีโอ" },
  share: { text: "MYOUKEE — สร้างคาราโอเกะ AI จากเพลงใดก็ได้ในไม่กี่วินาที! 🎤🎶", copied: "คัดลอกแล้ว!", copyLink: "คัดลอกลิงก์", shareNative: "แชร์...", closeMenu: "ปิดเมนู", shareApp: "แชร์แอป" },
  status: { starting: "กำลังเริ่ม…", waitingQueue: "รอคิว", isolatingVocals: "แยกเสียงร้อง", transcribing: "ถอดเนื้อเพลง", awaitingReview: "รอการตรวจสอบ", renderingVideo: "เรนเดอร์วิดีโอ", complete: "เสร็จสิ้น", failed: "ล้มเหลว" },
  jobPage: { ...en.jobPage, loading: "กำลังโหลด...", notFound: "ไม่พบงาน", backToStudio: "กลับสตูดิโอ", backToGallery: "กลับแกลเลอรี่", noVocal: "เฉพาะดนตรี", karaokeVideo: "วิดีโอคาราโอเกะ", retry: "ลองใหม่", buyCredits: "ซื้อเครดิต", singNowTitle: "ร้องเลย", start: "เริ่ม", trackDetails: "รายละเอียดแทร็ก", statusLabel: "สถานะ", statusSuccess: "สำเร็จ", wordsLabel: "คำ", wordsTranscribed: "คำที่ถอดแล้ว", lyricsTitle: "เนื้อเพลง", noVocalDetected: "ไม่พบเสียงร้องในแทร็กนี้", toastDoneTitle: "🎤 คาราโอเกะพร้อมแล้ว!", toastDoneDesc: "ร้องเพลงได้เลย!", toastChargedTitle: (n) => `ใช้ ${n} เครดิต`, toastChargedDesc: (b) => `ยอดคงเหลือ: ${b} เครดิต` },
  transcript: { title: "ตรวจสอบเนื้อเพลง", desc: "แก้ไขข้อความโดยตรง การเปลี่ยนแปลงจะรักษาจังหวะเดิม", reset: "รีเซ็ต", placeholder: "ไม่พบเสียงร้องในไฟล์...", words: "คำ", edited: "แก้ไขแล้ว", processing: "เริ่มประมวลผล…", confirmCreate: "ยืนยันและสร้างวิดีโอ", error: "ข้อผิดพลาด:" },
  sing: { ...en.sing, readyToSing: "พร้อมร้องเพลงหรือยัง?", startBtn: "เริ่ม", micVolume: "ระดับเสียงไมค์", backingVolume: "ระดับเสียงดนตรี (หูฟัง)", vocalEffects: "เอฟเฟกต์เสียง", resetDefaults: "รีเซ็ตเป็นค่าเริ่มต้น", micUnavailable: "ไมค์ไม่พร้อมใช้งาน", points: "คะแนน", pitchAccuracy: "ความแม่นยำของเสียง", timing: "จังหวะ", stability: "ความเสถียร", wordsLabel: "คำ", expression: "การแสดงออก", artistComparison: "เปรียบเทียบกับศิลปินต้นฉบับ", bestMoment: "ช่วงเวลาที่ดีที่สุด", recordAgain: "อัดใหม่ 🎤", shareResult: "แชร์ผลลัพธ์", challengeFriend: "ท้าเพื่อน 🏆", singAgain: "ร้องอีกครั้ง", challengeWin: (name) => `🏆 คุณชนะ ${name}!`, challengeLose: (name) => `😤 ${name} ยังคงนำอยู่...`, shareTextWithScore: (song, score) => `ฉันร้อง "${song}" บน MYOUKEE ได้ ${score}/100! 🎤 คุณทำได้เท่าไหร่?`, shareTextNoScore: (song) => `ฉันเปลี่ยน "${song}" เป็นคาราโอเกะบน MYOUKEE!`, someoneDefault: "ใครบางคน" },
});

const vi: UITranslations = cloneWithLang(en, {
  skipToContent: "Chuyển đến nội dung chính", autoDetect: "Tự động nhận diện",
  bg: { aurora: "Cực quang", neon_pulse: "Neon", fire_storm: "Bão lửa", ocean_deep: "Đại dương", galaxy: "Ngân hà", sunset_vibes: "Hoàng hôn", matrix_rain: "Ma trận", electric_storm: "Bão sét", golden_luxury: "Vàng sang trọng", cherry_blossom: "Hoa anh đào", cyber_punk: "Cyberpunk", changeBackground: "Đổi nền", reRendering: "Đang render lại...", applyNew: "Áp dụng nền mới", chooseBg: "🎨 Chọn nền video" },
  share: { text: "MYOUKEE — Tạo karaoke AI từ bất kỳ bài hát nào trong vài giây! 🎤🎶", copied: "Đã sao chép!", copyLink: "Sao chép liên kết", shareNative: "Chia sẻ...", closeMenu: "Đóng menu", shareApp: "Chia sẻ ứng dụng" },
  status: { starting: "Đang bắt đầu…", waitingQueue: "Đang chờ", isolatingVocals: "Tách giọng hát", transcribing: "Chuyển lời", awaitingReview: "Chờ xác nhận", renderingVideo: "Render video", complete: "Hoàn tất", failed: "Thất bại" },
  jobPage: { ...en.jobPage, loading: "Đang tải...", notFound: "Không tìm thấy", backToStudio: "Quay lại studio", backToGallery: "Quay lại thư viện", noVocal: "Nhạc nền", karaokeVideo: "Video karaoke", retry: "Thử lại", buyCredits: "Mua credits", singNowTitle: "Hát ngay", start: "Bắt đầu", trackDetails: "Chi tiết bài hát", statusLabel: "Trạng thái", statusSuccess: "Thành công", wordsLabel: "Từ", wordsTranscribed: "từ đã chuyển", lyricsTitle: "Lời bài hát", noVocalDetected: "Không phát hiện giọng hát trong bài này.", toastDoneTitle: "🎤 Karaoke đã sẵn sàng!", toastDoneDesc: "Bạn có thể hát ngay!", toastChargedTitle: (n) => `Đã dùng ${n} credits`, toastChargedDesc: (b) => `Số dư mới: ${b} credits` },
  transcript: { title: "Kiểm tra lời", desc: "Chỉnh sửa trực tiếp. Thay đổi từ sẽ giữ nguyên thời gian.", reset: "Đặt lại", placeholder: "Không phát hiện giọng hát trong file...", words: "từ", edited: "đã sửa", processing: "Bắt đầu xử lý…", confirmCreate: "Xác nhận và tạo video", error: "Lỗi:" },
  sing: { ...en.sing, readyToSing: "Sẵn sàng hát chưa?", startBtn: "Bắt đầu", micVolume: "Âm lượng mic", backingVolume: "Âm lượng nhạc nền (tai nghe)", vocalEffects: "Hiệu ứng giọng hát", resetDefaults: "Đặt lại mặc định", micUnavailable: "Mic không khả dụng", points: "điểm", pitchAccuracy: "Độ chính xác cao độ", timing: "Nhịp", stability: "Độ ổn định", wordsLabel: "Từ", expression: "Biểu cảm", artistComparison: "So sánh với ca sĩ gốc", bestMoment: "Khoảnh khắc tuyệt nhất", recordAgain: "Thu âm lại 🎤", shareResult: "Chia sẻ kết quả", challengeFriend: "Thách đấu bạn bè 🏆", singAgain: "Hát lại", challengeWin: (name) => `🏆 Bạn đã thắng ${name}!`, challengeLose: (name) => `😤 ${name} vẫn dẫn trước...`, shareTextWithScore: (song, score) => `Tôi hát "${song}" trên MYOUKEE và được ${score}/100! 🎤 Bạn thử đi!`, shareTextNoScore: (song) => `Tôi đã biến "${song}" thành karaoke trên MYOUKEE!`, someoneDefault: "Ai đó" },
});

const tl: UITranslations = cloneWithLang(en, {
  skipToContent: "Lumipat sa pangunahing nilalaman", autoDetect: "Auto Detect",
  bg: { aurora: "Aurora", neon_pulse: "Neon", fire_storm: "Fire Storm", ocean_deep: "Karagatan", galaxy: "Kalawakan", sunset_vibes: "Paglubog ng Araw", matrix_rain: "Matrix", electric_storm: "Kidlat", golden_luxury: "Gintong Luho", cherry_blossom: "Cherry Blossom", cyber_punk: "Cyberpunk", changeBackground: "Palitan ang Background", reRendering: "Nire-render ulit...", applyNew: "Ilagay ang Bagong Background", chooseBg: "🎨 Pumili ng Background" },
  share: { text: "MYOUKEE — Gumawa ng AI karaoke mula sa kahit anong kanta sa ilang segundo! 🎤🎶", copied: "Nakopya!", copyLink: "Kopyahin ang Link", shareNative: "I-share...", closeMenu: "Isara ang menu", shareApp: "I-share ang App" },
  status: { starting: "Nagsisimula…", waitingQueue: "Naghihintay sa pila", isolatingVocals: "Hinahiwalay ang boses", transcribing: "Tinatranscribe", awaitingReview: "Naghihintay ng review", renderingVideo: "Nire-render ang video", complete: "Tapos na", failed: "Nabigo" },
  jobPage: { ...en.jobPage, loading: "Naglo-load...", notFound: "Hindi natagpuan", backToStudio: "Bumalik sa Studio", backToGallery: "Bumalik sa Gallery", noVocal: "Instrumental", karaokeVideo: "Karaoke Video", retry: "Ulitin", buyCredits: "Bumili ng Credits", singNowTitle: "Kumanta na", start: "Simulan", trackDetails: "Detalye ng Track", statusLabel: "Status", statusSuccess: "Matagumpay", wordsLabel: "Salita", wordsTranscribed: "salitang na-transcribe", lyricsTitle: "Lyrics", noVocalDetected: "Walang nakitang boses sa track na ito.", toastDoneTitle: "🎤 Handa na ang karaoke!", toastDoneDesc: "Pwede ka nang kumanta!", toastChargedTitle: (n) => `${n} credits ginamit`, toastChargedDesc: (b) => `Bagong balanse: ${b} credits` },
  transcript: { title: "I-review ang Lyrics", desc: "I-edit ang teksto nang direkta. Mananatili ang orihinal na timing.", reset: "I-reset", placeholder: "Walang nakitang boses sa file...", words: "salita", edited: "na-edit", processing: "Nagsisimulang mag-process…", confirmCreate: "Kumpirmahin at Gumawa ng Video", error: "Error:" },
  sing: { ...en.sing, readyToSing: "Handa ka na bang kumanta?", startBtn: "Simulan", micVolume: "Volume ng Mic", backingVolume: "Volume ng Backing (earphones)", vocalEffects: "Mga Vocal Effect", resetDefaults: "I-reset sa default", micUnavailable: "Hindi available ang mic", points: "puntos", pitchAccuracy: "Pitch Accuracy", timing: "Timing", stability: "Stability", wordsLabel: "Lyrics", expression: "Expression", artistComparison: "Paghahambing sa Original Artist", bestMoment: "Pinakamahusay mong sandali", recordAgain: "Mag-record ulit 🎤", shareResult: "I-share ang Resulta", challengeFriend: "Hamunin ang Kaibigan 🏆", singAgain: "Kumanta Ulit", challengeWin: (name) => `🏆 Tinalo mo si ${name}!`, challengeLose: (name) => `😤 Nangunguna pa rin si ${name}...`, shareTextWithScore: (song, score) => `Kumanta ako ng "${song}" sa MYOUKEE at nakakuha ng ${score}/100! 🎤 Kaya mo ba?`, shareTextNoScore: (song) => `Ginawa kong karaoke ang "${song}" sa MYOUKEE!`, someoneDefault: "Isang tao" },
});

const id: UITranslations = cloneWithLang(en, {
  skipToContent: "Lewati ke konten utama", autoDetect: "Deteksi Otomatis",
  bg: { aurora: "Aurora", neon_pulse: "Neon", fire_storm: "Badai Api", ocean_deep: "Lautan", galaxy: "Galaksi", sunset_vibes: "Matahari Terbenam", matrix_rain: "Matrix", electric_storm: "Badai Petir", golden_luxury: "Emas Mewah", cherry_blossom: "Bunga Sakura", cyber_punk: "Cyberpunk", changeBackground: "Ganti Latar Belakang", reRendering: "Merender ulang...", applyNew: "Terapkan Latar Baru", chooseBg: "🎨 Pilih Latar Video" },
  share: { text: "MYOUKEE — Buat karaoke AI dari lagu apa saja dalam hitungan detik! 🎤🎶", copied: "Disalin!", copyLink: "Salin Tautan", shareNative: "Bagikan...", closeMenu: "Tutup menu", shareApp: "Bagikan Aplikasi" },
  status: { starting: "Memulai…", waitingQueue: "Menunggu dalam antrean", isolatingVocals: "Memisahkan vokal", transcribing: "Transkripsi", awaitingReview: "Menunggu review", renderingVideo: "Merender video", complete: "Selesai", failed: "Gagal" },
  jobPage: { ...en.jobPage, loading: "Memuat detail...", notFound: "Tugas tidak ditemukan", backToStudio: "Kembali ke Studio", backToGallery: "Kembali ke Galeri", noVocal: "Instrumental", karaokeVideo: "Video Karaoke", retry: "Coba Lagi", buyCredits: "Beli Kredit", singNowTitle: "Nyanyi Sekarang", start: "Mulai", trackDetails: "Detail Track", statusLabel: "Status", statusSuccess: "Berhasil", wordsLabel: "Kata", wordsTranscribed: "kata ditranskrip", lyricsTitle: "Lirik Lagu", noVocalDetected: "Tidak ada vokal yang terdeteksi di track ini.", toastDoneTitle: "🎤 Karaoke siap!", toastDoneDesc: "Kamu bisa menyanyi sekarang!", toastChargedTitle: (n) => `${n} kredit digunakan`, toastChargedDesc: (b) => `Saldo baru: ${b} kredit` },
  transcript: { title: "Periksa Transkripsi", desc: "Edit teks langsung. Perubahan kata akan mempertahankan timing asli.", reset: "Reset", placeholder: "Tidak ada vokal terdeteksi di file...", words: "kata", edited: "diedit", processing: "Memulai pemrosesan…", confirmCreate: "Konfirmasi & Buat Video", error: "Error:" },
  sing: { ...en.sing, readyToSing: "Siap menyanyi?", startBtn: "Mulai", micVolume: "Volume Mikrofon", backingVolume: "Volume Pengiring (earphone)", vocalEffects: "Efek Vokal", resetDefaults: "Reset ke default", micUnavailable: "Mikrofon tidak tersedia", points: "poin", pitchAccuracy: "Akurasi Nada", timing: "Timing", stability: "Stabilitas", wordsLabel: "Kata", expression: "Ekspresi", artistComparison: "Perbandingan dengan Artis Asli", bestMoment: "Momen terbaikmu", recordAgain: "Rekam Lagi 🎤", shareResult: "Bagikan Hasil", challengeFriend: "Tantang Teman 🏆", singAgain: "Nyanyi Lagi", challengeWin: (name) => `🏆 Kamu mengalahkan ${name}!`, challengeLose: (name) => `😤 ${name} masih memimpin...`, shareTextWithScore: (song, score) => `Aku menyanyi "${song}" di MYOUKEE dan mendapat ${score}/100! 🎤 Bisakah kamu mengalahkanku?`, shareTextNoScore: (song) => `Aku mengubah "${song}" menjadi karaoke di MYOUKEE!`, someoneDefault: "Seseorang" },
});

const ALL: Record<SupportedLang, UITranslations> = { he, en, ar, ru, es, fr, de, ja, zh, ko, th, vi, tl, id };

export function useUITranslations(): UITranslations {
  const { lang } = useLang();
  return ALL[lang] ?? en;
}

export function getBgLabel(translations: UITranslations, bgId: string): string {
  return translations.bg[bgId] ?? bgId;
}
