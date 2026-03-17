import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";
import { useLang, SupportedLang } from "@/contexts/LanguageContext";

interface Section {
  title: string;
  body?: string;
  bullets?: string[];
  contactHtml?: string;
}

const content: Partial<Record<SupportedLang, Section[]>> = {
  he: [
    { title: "1. מידע שאנו אוספים", body: "MYOUKEE אוספת את המידע הבא:", bullets: ["פרטי חשבון Google (שם, כתובת דוא\"ל, תמונת פרופיל) — לצורך אימות בלבד.", "קבצי שמע ווידאו שאתה מעלה לצורך עיבוד קריוקי.", "מידע טכני כגון כתובת IP, סוג דפדפן ונתוני שימוש אנונימיים.", "ציוני ביצועים שמרת בלידרבורד (שם, ציון, שם שיר)."] },
    { title: "2. שימוש במידע", body: "אנו משתמשים במידע כדי:", bullets: ["לספק את שירות הקריוקי — עיבוד, הפרדת ווקאל ותמלול.", "לנהל את מאזן הקרדיטים שלך.", "לשפר את המערכת באמצעות נתונים אנונימיים.", "לאפשר גלריית היסטוריה אישית."] },
    { title: "3. אחסון וביטחון", body: "הקבצים המעובדים מאוחסנים בשרת מאובטח. קבצים עשויים להימחק לאחר 30 יום מרגע היצירה. אנו מיישמים הצפנה בהעברה (TLS) ומגבילים גישה לנתונים." },
    { title: "4. שיתוף מידע עם צדדים שלישיים", body: "אנו לא מוכרים ולא משתפים את פרטיך האישיים עם צדדים שלישיים, למעט:", bullets: ["Stripe — לצורך עיבוד תשלומים בלבד.", "Google — לצורך אימות."] },
    { title: "5. זכויותיך", body: "בהתאם לחוק הגנת הפרטיות הישראלי ו-GDPR (לאזרחי האיחוד האירופי), יש לך זכות:", bullets: ["לעיין במידע שנאסף עליך.", "לבקש מחיקת חשבונך ונתוניך.", "לבקש תיקון מידע שגוי."], contactHtml: "לפניות: windot100@gmail.com" },
    { title: "6. עוגיות (Cookies)", body: "אנו משתמשים בעוגיות הכרחיות לצורך ניהול סשן. אין שימוש בעוגיות פרסומיות." },
    { title: "7. עדכונים למדיניות", body: "מדיניות זו עשויה להשתנות. שינויים מהותיים יפורסמו באתר ותישלח הודעה לכתובת הדוא\"ל הרשומה." },
  ],
  en: [
    { title: "1. Information We Collect", body: "MYOUKEE collects the following information:", bullets: ["Google account details (name, email address, profile picture) — for authentication only.", "Audio and video files you upload for karaoke processing.", "Technical information such as IP address, browser type, and anonymous usage data.", "Performance scores you save to the leaderboard (name, score, song name)."] },
    { title: "2. Use of Information", body: "We use the information to:", bullets: ["Provide the karaoke service — processing, vocal separation, and transcription.", "Manage your credits balance.", "Improve the system using anonymous data.", "Enable your personal history gallery."] },
    { title: "3. Storage and Security", body: "Processed files are stored on a secure server. Files may be deleted 30 days after creation. We implement encryption in transit (TLS) and restrict data access." },
    { title: "4. Sharing Information with Third Parties", body: "We do not sell or share your personal information with third parties, except:", bullets: ["Stripe — for payment processing only.", "Google — for authentication."] },
    { title: "5. Your Rights", body: "In accordance with Israeli Privacy Protection Law and GDPR (for EU citizens), you have the right to:", bullets: ["Review the information collected about you.", "Request deletion of your account and data.", "Request correction of inaccurate information."], contactHtml: "For inquiries: windot100@gmail.com" },
    { title: "6. Cookies", body: "We use essential cookies for session management. No advertising cookies are used." },
    { title: "7. Policy Updates", body: "This policy may change. Material changes will be published on the website and a notification will be sent to the registered email address." },
  ],
  ar: [
    { title: "1. المعلومات التي نجمعها", body: "تجمع MYOUKEE المعلومات التالية:", bullets: ["تفاصيل حساب Google (الاسم، البريد الإلكتروني، صورة الملف الشخصي) — للمصادقة فقط.", "ملفات الصوت والفيديو التي ترفعها لمعالجة الكاريوكي.", "معلومات تقنية مثل عنوان IP ونوع المتصفح وبيانات الاستخدام المجهولة.", "درجات الأداء المحفوظة في لوحة المتصدرين (الاسم، الدرجة، اسم الأغنية)."] },
    { title: "2. استخدام المعلومات", body: "نستخدم المعلومات من أجل:", bullets: ["تقديم خدمة الكاريوكي — المعالجة وفصل الصوت والنسخ.", "إدارة رصيد أرصدتك.", "تحسين النظام باستخدام بيانات مجهولة.", "تمكين معرض تاريخك الشخصي."] },
    { title: "3. التخزين والأمان", body: "يتم تخزين الملفات المعالجة على خادم آمن. قد يتم حذف الملفات بعد 30 يومًا من إنشائها. نطبق التشفير أثناء النقل (TLS) ونقيد الوصول إلى البيانات." },
    { title: "4. مشاركة المعلومات مع أطراف ثالثة", body: "نحن لا نبيع أو نشارك معلوماتك الشخصية مع أطراف ثالثة، باستثناء:", bullets: ["Stripe — لمعالجة المدفوعات فقط.", "Google — للمصادقة."] },
    { title: "5. حقوقك", body: "وفقًا لقانون حماية الخصوصية الإسرائيلي و-GDPR (لمواطني الاتحاد الأوروبي)، لديك الحق في:", bullets: ["مراجعة المعلومات المجمعة عنك.", "طلب حذف حسابك وبياناتك.", "طلب تصحيح المعلومات غير الدقيقة."], contactHtml: "للاستفسارات: windot100@gmail.com" },
    { title: "6. ملفات تعريف الارتباط (Cookies)", body: "نستخدم ملفات تعريف الارتباط الأساسية لإدارة الجلسة. لا نستخدم ملفات تعريف ارتباط إعلانية." },
    { title: "7. تحديثات السياسة", body: "قد تتغير هذه السياسة. سيتم نشر التغييرات الجوهرية على الموقع وإرسال إشعار إلى البريد الإلكتروني المسجل." },
  ],
  ru: [
    { title: "1. Информация, которую мы собираем", body: "MYOUKEE собирает следующую информацию:", bullets: ["Данные аккаунта Google (имя, email, фото профиля) — только для аутентификации.", "Аудио- и видеофайлы, которые вы загружаете для обработки караоке.", "Техническая информация: IP-адрес, тип браузера и анонимные данные об использовании.", "Результаты выступлений, сохранённые в рейтинге (имя, оценка, название песни)."] },
    { title: "2. Использование информации", body: "Мы используем информацию для:", bullets: ["Предоставления сервиса караоке — обработки, разделения вокала и транскрипции.", "Управления балансом ваших кредитов.", "Улучшения системы с использованием анонимных данных.", "Обеспечения личной галереи истории."] },
    { title: "3. Хранение и безопасность", body: "Обработанные файлы хранятся на защищённом сервере. Файлы могут быть удалены через 30 дней после создания. Мы используем шифрование при передаче (TLS) и ограничиваем доступ к данным." },
    { title: "4. Передача информации третьим лицам", body: "Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением:", bullets: ["Stripe — только для обработки платежей.", "Google — для аутентификации."] },
    { title: "5. Ваши права", body: "В соответствии с израильским Законом о защите конфиденциальности и GDPR (для граждан ЕС), вы имеете право:", bullets: ["Просматривать собранную о вас информацию.", "Запрашивать удаление вашего аккаунта и данных.", "Запрашивать исправление неточной информации."], contactHtml: "По вопросам: windot100@gmail.com" },
    { title: "6. Файлы cookie", body: "Мы используем только необходимые cookie для управления сессией. Рекламные cookie не используются." },
    { title: "7. Обновления политики", body: "Эта политика может измениться. Существенные изменения будут опубликованы на сайте, и уведомление будет отправлено на зарегистрированный email." },
  ],
  es: [
    { title: "1. Información que Recopilamos", body: "MYOUKEE recopila la siguiente información:", bullets: ["Datos de la cuenta de Google (nombre, correo electrónico, foto de perfil) — solo para autenticación.", "Archivos de audio y video que sube para el procesamiento de karaoke.", "Información técnica como dirección IP, tipo de navegador y datos de uso anónimos.", "Puntuaciones de rendimiento guardadas en la clasificación (nombre, puntuación, nombre de la canción)."] },
    { title: "2. Uso de la Información", body: "Utilizamos la información para:", bullets: ["Proporcionar el servicio de karaoke — procesamiento, separación vocal y transcripción.", "Gestionar su saldo de créditos.", "Mejorar el sistema utilizando datos anónimos.", "Habilitar su galería de historial personal."] },
    { title: "3. Almacenamiento y Seguridad", body: "Los archivos procesados se almacenan en un servidor seguro. Los archivos pueden eliminarse 30 días después de su creación. Implementamos cifrado en tránsito (TLS) y restringimos el acceso a los datos." },
    { title: "4. Compartir Información con Terceros", body: "No vendemos ni compartimos su información personal con terceros, excepto:", bullets: ["Stripe — solo para procesamiento de pagos.", "Google — para autenticación."] },
    { title: "5. Sus Derechos", body: "De acuerdo con la Ley de Protección de la Privacidad de Israel y el GDPR (para ciudadanos de la UE), usted tiene derecho a:", bullets: ["Revisar la información recopilada sobre usted.", "Solicitar la eliminación de su cuenta y datos.", "Solicitar la corrección de información inexacta."], contactHtml: "Para consultas: windot100@gmail.com" },
    { title: "6. Cookies", body: "Utilizamos cookies esenciales para la gestión de sesiones. No se utilizan cookies publicitarias." },
    { title: "7. Actualizaciones de la Política", body: "Esta política puede cambiar. Los cambios sustanciales se publicarán en el sitio web y se enviará una notificación al correo electrónico registrado." },
  ],
  fr: [
    { title: "1. Informations que Nous Collectons", body: "MYOUKEE collecte les informations suivantes :", bullets: ["Détails du compte Google (nom, adresse e-mail, photo de profil) — pour l'authentification uniquement.", "Fichiers audio et vidéo que vous téléchargez pour le traitement karaoké.", "Informations techniques telles que l'adresse IP, le type de navigateur et les données d'utilisation anonymes.", "Scores de performance enregistrés dans le classement (nom, score, nom de la chanson)."] },
    { title: "2. Utilisation des Informations", body: "Nous utilisons les informations pour :", bullets: ["Fournir le service de karaoké — traitement, séparation vocale et transcription.", "Gérer votre solde de crédits.", "Améliorer le système à l'aide de données anonymes.", "Permettre votre galerie d'historique personnel."] },
    { title: "3. Stockage et Sécurité", body: "Les fichiers traités sont stockés sur un serveur sécurisé. Les fichiers peuvent être supprimés 30 jours après leur création. Nous mettons en œuvre le chiffrement en transit (TLS) et restreignons l'accès aux données." },
    { title: "4. Partage d'Informations avec des Tiers", body: "Nous ne vendons ni ne partageons vos informations personnelles avec des tiers, sauf :", bullets: ["Stripe — pour le traitement des paiements uniquement.", "Google — pour l'authentification."] },
    { title: "5. Vos Droits", body: "Conformément à la loi israélienne sur la protection de la vie privée et au RGPD (pour les citoyens de l'UE), vous avez le droit de :", bullets: ["Consulter les informations collectées à votre sujet.", "Demander la suppression de votre compte et de vos données.", "Demander la correction d'informations inexactes."], contactHtml: "Pour les demandes : windot100@gmail.com" },
    { title: "6. Cookies", body: "Nous utilisons des cookies essentiels pour la gestion de session. Aucun cookie publicitaire n'est utilisé." },
    { title: "7. Mises à Jour de la Politique", body: "Cette politique peut changer. Les modifications substantielles seront publiées sur le site web et une notification sera envoyée à l'adresse e-mail enregistrée." },
  ],
  de: [
    { title: "1. Informationen, die wir sammeln", body: "MYOUKEE sammelt die folgenden Informationen:", bullets: ["Google-Kontodaten (Name, E-Mail-Adresse, Profilbild) — nur zur Authentifizierung.", "Audio- und Videodateien, die Sie zur Karaoke-Verarbeitung hochladen.", "Technische Informationen wie IP-Adresse, Browsertyp und anonyme Nutzungsdaten.", "Leistungsergebnisse, die in der Rangliste gespeichert werden (Name, Punktzahl, Songname)."] },
    { title: "2. Verwendung der Informationen", body: "Wir verwenden die Informationen, um:", bullets: ["Den Karaoke-Dienst bereitzustellen — Verarbeitung, Gesangstrennung und Transkription.", "Ihr Guthaben zu verwalten.", "Das System mit anonymen Daten zu verbessern.", "Ihre persönliche Verlaufsgalerie zu ermöglichen."] },
    { title: "3. Speicherung und Sicherheit", body: "Verarbeitete Dateien werden auf einem sicheren Server gespeichert. Dateien können 30 Tage nach der Erstellung gelöscht werden. Wir setzen Verschlüsselung bei der Übertragung (TLS) ein und beschränken den Datenzugriff." },
    { title: "4. Weitergabe von Informationen an Dritte", body: "Wir verkaufen oder teilen Ihre persönlichen Daten nicht mit Dritten, außer:", bullets: ["Stripe — nur für die Zahlungsabwicklung.", "Google — zur Authentifizierung."] },
    { title: "5. Ihre Rechte", body: "Gemäß dem israelischen Datenschutzgesetz und der DSGVO (für EU-Bürger) haben Sie das Recht:", bullets: ["Die über Sie gesammelten Informationen einzusehen.", "Die Löschung Ihres Kontos und Ihrer Daten zu beantragen.", "Die Korrektur ungenauer Informationen zu verlangen."], contactHtml: "Für Anfragen: windot100@gmail.com" },
    { title: "6. Cookies", body: "Wir verwenden nur notwendige Cookies für die Sitzungsverwaltung. Es werden keine Werbe-Cookies verwendet." },
    { title: "7. Richtlinienaktualisierungen", body: "Diese Richtlinie kann sich ändern. Wesentliche Änderungen werden auf der Website veröffentlicht und eine Benachrichtigung an die registrierte E-Mail-Adresse gesendet." },
  ],
};

export default function Privacy() {
  const { lang, t } = useLang();
  const isRtl = t.dir === "rtl";
  const sections = content[lang] ?? content["en"]!;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12" dir={t.dir}>
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-white mb-8 transition-colors">
        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
        {t.nav.createKaraoke}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-3xl font-display font-bold">{t.consent.privacyLink}</h1>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
        {sections.map((s, i) => (
          <section key={i}>
            {s.title && <h2 className="text-white text-lg font-semibold mb-2">{s.title}</h2>}
            {s.body && <p>{s.body}</p>}
            {s.bullets && (
              <ul className="list-disc list-inside space-y-1 mt-2">
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
            {s.contactHtml && (
              <p className="mt-2">
                {s.contactHtml.split("windot100@gmail.com")[0]}
                <a href="mailto:windot100@gmail.com" className="text-primary hover:underline">windot100@gmail.com</a>
              </p>
            )}
          </section>
        ))}

        <p className="text-xs text-muted-foreground/50 pt-4 border-t border-white/5">
          MYOUKEE &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
