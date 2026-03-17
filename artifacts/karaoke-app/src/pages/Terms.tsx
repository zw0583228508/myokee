import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { useLang, SupportedLang } from "@/contexts/LanguageContext";

interface Section {
  title: string;
  body?: string;
  bullets?: string[];
}

const content: Partial<Record<SupportedLang, Section[]>> = {
  he: [
    { title: "1. הסכמה לתנאים", body: "השימוש ב-MYOUKEE מהווה הסכמה מלאה לתנאי שימוש אלו. אם אינך מסכים, נא להפסיק את השימוש באתר." },
    { title: "2. תיאור השירות", body: "MYOUKEE מספקת שירות המרת שירים לפורמט קריוקי באמצעות בינה מלאכותית. השירות כולל:", bullets: ["הפרדת ווקאל מוזיקלי (Demucs AI).", "תמלול מילות שיר (Whisper AI).", "יצירת וידאו קריוקי סינמטי.", "ניתוח שירה ובדיקת ביצועים."] },
    { title: "3. זכויות יוצרים ותוכן", body: "אתה מצהיר כי:", bullets: ["יש לך זכות חוקית להשתמש בתוכן שאתה מעלה.", "אינך מעלה תוכן המפר זכויות יוצרים של אחרים.", "השימוש בתוצרים הינו לשימוש אישי בלבד."] },
    { title: "", body: "MYOUKEE אינה אחראית לשימוש לא חוקי בתוכן מוגן זכויות יוצרים." },
    { title: "4. קרדיטים ותשלומים", bullets: ["40 שניות ראשונות הן חינמיות בכל עיבוד.", "קרדיטים הם אמצעי תשלום ואינם ניתנים להחזר.", "מחירים עשויים להשתנות עם הודעה מוקדמת.", "עסקאות מעובדות דרך Stripe בצורה מאובטחת."] },
    { title: "5. הגבלת אחריות", body: "MYOUKEE מסופקת \"כמות שהיא\" (AS-IS). איננו מתחייבים לזמינות רציפה, ואיננו אחראים לנזקים ישירים או עקיפים הנובעים מהשימוש בשירות." },
    { title: "6. שימוש אסור", body: "אסור:", bullets: ["לנסות לעקוף את מנגנוני הביטחון.", "להעלות תוכן פוגעני, מיני, אלים או בלתי חוקי.", "לבצע reverse engineering למערכת.", "לעשות שימוש מסחרי ללא הרשאה בכתב."] },
    { title: "7. ביטול חשבון", body: "אנו שומרים הזכות לבטל חשבונות המפרים תנאים אלו, ללא הודעה מוקדמת." },
    { title: "8. דין חל וסמכות שיפוט", body: "תנאים אלו כפופים לדיני מדינת ישראל. כל סכסוך יידון בבתי המשפט של ישראל." },
  ],
  en: [
    { title: "1. Acceptance of Terms", body: "By using MYOUKEE, you fully agree to these Terms of Service. If you do not agree, please discontinue use of the site." },
    { title: "2. Description of Service", body: "MYOUKEE provides a service that converts songs into karaoke format using artificial intelligence. The service includes:", bullets: ["Musical vocal separation (Demucs AI).", "Song lyrics transcription (Whisper AI).", "Cinematic karaoke video creation.", "Singing analysis and performance evaluation."] },
    { title: "3. Copyright and Content", body: "You represent that:", bullets: ["You have the legal right to use the content you upload.", "You are not uploading content that infringes on the copyrights of others.", "Use of the output is for personal use only."] },
    { title: "", body: "MYOUKEE is not responsible for any illegal use of copyrighted content." },
    { title: "4. Credits and Payments", bullets: ["The first 40 seconds are free for every processing.", "Credits are a payment method and are non-refundable.", "Prices may change with prior notice.", "Transactions are processed securely through Stripe."] },
    { title: "5. Limitation of Liability", body: "MYOUKEE is provided \"AS-IS.\" We do not guarantee continuous availability, and we are not liable for direct or indirect damages arising from the use of the service." },
    { title: "6. Prohibited Use", body: "The following is prohibited:", bullets: ["Attempting to bypass security mechanisms.", "Uploading offensive, sexual, violent, or illegal content.", "Reverse engineering the system.", "Commercial use without written permission."] },
    { title: "7. Account Termination", body: "We reserve the right to terminate accounts that violate these terms without prior notice." },
    { title: "8. Governing Law and Jurisdiction", body: "These terms are governed by the laws of the State of Israel. Any dispute shall be adjudicated in the courts of Israel." },
  ],
  ar: [
    { title: "1. قبول الشروط", body: "استخدام MYOUKEE يشكل موافقة كاملة على شروط الخدمة هذه. إذا كنت لا توافق، يرجى التوقف عن استخدام الموقع." },
    { title: "2. وصف الخدمة", body: "توفر MYOUKEE خدمة تحويل الأغاني إلى صيغة كاريوكي باستخدام الذكاء الاصطناعي. تشمل الخدمة:", bullets: ["فصل الصوت الموسيقي (Demucs AI).", "نسخ كلمات الأغاني (Whisper AI).", "إنشاء فيديو كاريوكي سينمائي.", "تحليل الغناء وتقييم الأداء."] },
    { title: "3. حقوق النشر والمحتوى", body: "أنت تقر بأن:", bullets: ["لديك الحق القانوني في استخدام المحتوى الذي ترفعه.", "أنت لا ترفع محتوى ينتهك حقوق النشر للآخرين.", "استخدام المخرجات هو للاستخدام الشخصي فقط."] },
    { title: "", body: "MYOUKEE ليست مسؤولة عن أي استخدام غير قانوني لمحتوى محمي بحقوق النشر." },
    { title: "4. الأرصدة والمدفوعات", bullets: ["أول 40 ثانية مجانية في كل معالجة.", "الأرصدة هي وسيلة دفع وغير قابلة للاسترداد.", "قد تتغير الأسعار مع إشعار مسبق.", "تتم معالجة المعاملات بأمان عبر Stripe."] },
    { title: "5. تحديد المسؤولية", body: "يتم توفير MYOUKEE \"كما هي\". لا نضمن التوفر المستمر، ولسنا مسؤولين عن الأضرار المباشرة أو غير المباشرة الناتجة عن استخدام الخدمة." },
    { title: "6. الاستخدام المحظور", body: "يُحظر:", bullets: ["محاولة تجاوز آليات الأمان.", "رفع محتوى مسيء أو جنسي أو عنيف أو غير قانوني.", "إجراء هندسة عكسية للنظام.", "الاستخدام التجاري بدون إذن كتابي."] },
    { title: "7. إنهاء الحساب", body: "نحتفظ بالحق في إنهاء الحسابات التي تنتهك هذه الشروط بدون إشعار مسبق." },
    { title: "8. القانون الحاكم والاختصاص القضائي", body: "تخضع هذه الشروط لقوانين دولة إسرائيل. يتم الفصل في أي نزاع في محاكم إسرائيل." },
  ],
  ru: [
    { title: "1. Принятие условий", body: "Использование MYOUKEE означает полное согласие с настоящими Условиями использования. Если вы не согласны, пожалуйста, прекратите использование сайта." },
    { title: "2. Описание сервиса", body: "MYOUKEE предоставляет сервис конвертации песен в формат караоке с использованием искусственного интеллекта. Сервис включает:", bullets: ["Разделение музыкального вокала (Demucs AI).", "Транскрипция текстов песен (Whisper AI).", "Создание кинематографического караоке-видео.", "Анализ пения и оценка исполнения."] },
    { title: "3. Авторские права и контент", body: "Вы заявляете, что:", bullets: ["У вас есть законное право использовать загружаемый контент.", "Вы не загружаете контент, нарушающий авторские права других лиц.", "Использование результатов предназначено только для личного использования."] },
    { title: "", body: "MYOUKEE не несёт ответственности за незаконное использование контента, защищённого авторским правом." },
    { title: "4. Кредиты и платежи", bullets: ["Первые 40 секунд бесплатны при каждой обработке.", "Кредиты являются средством оплаты и не подлежат возврату.", "Цены могут изменяться с предварительным уведомлением.", "Транзакции обрабатываются безопасно через Stripe."] },
    { title: "5. Ограничение ответственности", body: "MYOUKEE предоставляется «как есть» (AS-IS). Мы не гарантируем непрерывную доступность и не несём ответственности за прямые или косвенные убытки, возникшие в результате использования сервиса." },
    { title: "6. Запрещённое использование", body: "Запрещается:", bullets: ["Попытки обхода механизмов безопасности.", "Загрузка оскорбительного, сексуального, насильственного или незаконного контента.", "Обратная разработка системы.", "Коммерческое использование без письменного разрешения."] },
    { title: "7. Удаление аккаунта", body: "Мы оставляем за собой право удалять аккаунты, нарушающие эти условия, без предварительного уведомления." },
    { title: "8. Применимое право и юрисдикция", body: "Настоящие условия регулируются законодательством Государства Израиль. Любой спор рассматривается в судах Израиля." },
  ],
  es: [
    { title: "1. Aceptación de los Términos", body: "El uso de MYOUKEE constituye la aceptación total de estos Términos de Servicio. Si no está de acuerdo, por favor deje de usar el sitio." },
    { title: "2. Descripción del Servicio", body: "MYOUKEE proporciona un servicio de conversión de canciones a formato karaoke mediante inteligencia artificial. El servicio incluye:", bullets: ["Separación vocal musical (Demucs AI).", "Transcripción de letras de canciones (Whisper AI).", "Creación de video karaoke cinematográfico.", "Análisis de canto y evaluación de rendimiento."] },
    { title: "3. Derechos de Autor y Contenido", body: "Usted declara que:", bullets: ["Tiene el derecho legal de usar el contenido que sube.", "No está subiendo contenido que infrinja los derechos de autor de otros.", "El uso de los resultados es solo para uso personal."] },
    { title: "", body: "MYOUKEE no es responsable del uso ilegal de contenido protegido por derechos de autor." },
    { title: "4. Créditos y Pagos", bullets: ["Los primeros 40 segundos son gratuitos en cada procesamiento.", "Los créditos son un medio de pago y no son reembolsables.", "Los precios pueden cambiar con aviso previo.", "Las transacciones se procesan de forma segura a través de Stripe."] },
    { title: "5. Limitación de Responsabilidad", body: "MYOUKEE se proporciona \"TAL CUAL\" (AS-IS). No garantizamos disponibilidad continua y no somos responsables de daños directos o indirectos derivados del uso del servicio." },
    { title: "6. Uso Prohibido", body: "Está prohibido:", bullets: ["Intentar eludir los mecanismos de seguridad.", "Subir contenido ofensivo, sexual, violento o ilegal.", "Realizar ingeniería inversa del sistema.", "Uso comercial sin permiso por escrito."] },
    { title: "7. Cancelación de Cuenta", body: "Nos reservamos el derecho de cancelar cuentas que violen estos términos sin previo aviso." },
    { title: "8. Ley Aplicable y Jurisdicción", body: "Estos términos se rigen por las leyes del Estado de Israel. Cualquier disputa se resolverá en los tribunales de Israel." },
  ],
  fr: [
    { title: "1. Acceptation des Conditions", body: "L'utilisation de MYOUKEE constitue une acceptation complète de ces Conditions d'Utilisation. Si vous n'êtes pas d'accord, veuillez cesser d'utiliser le site." },
    { title: "2. Description du Service", body: "MYOUKEE fournit un service de conversion de chansons au format karaoké à l'aide de l'intelligence artificielle. Le service comprend :", bullets: ["Séparation vocale musicale (Demucs AI).", "Transcription des paroles (Whisper AI).", "Création de vidéo karaoké cinématique.", "Analyse du chant et évaluation de la performance."] },
    { title: "3. Droits d'Auteur et Contenu", body: "Vous déclarez que :", bullets: ["Vous avez le droit légal d'utiliser le contenu que vous téléchargez.", "Vous ne téléchargez pas de contenu qui enfreint les droits d'auteur d'autrui.", "L'utilisation des résultats est à des fins personnelles uniquement."] },
    { title: "", body: "MYOUKEE n'est pas responsable de l'utilisation illégale de contenu protégé par le droit d'auteur." },
    { title: "4. Crédits et Paiements", bullets: ["Les 40 premières secondes sont gratuites pour chaque traitement.", "Les crédits sont un moyen de paiement et ne sont pas remboursables.", "Les prix peuvent changer avec un préavis.", "Les transactions sont traitées en toute sécurité via Stripe."] },
    { title: "5. Limitation de Responsabilité", body: "MYOUKEE est fourni \"TEL QUEL\" (AS-IS). Nous ne garantissons pas une disponibilité continue et ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation du service." },
    { title: "6. Utilisation Interdite", body: "Il est interdit de :", bullets: ["Tenter de contourner les mécanismes de sécurité.", "Télécharger du contenu offensant, sexuel, violent ou illégal.", "Effectuer de l'ingénierie inverse du système.", "Usage commercial sans autorisation écrite."] },
    { title: "7. Résiliation de Compte", body: "Nous nous réservons le droit de résilier les comptes qui enfreignent ces conditions sans préavis." },
    { title: "8. Droit Applicable et Juridiction", body: "Ces conditions sont régies par les lois de l'État d'Israël. Tout litige sera jugé par les tribunaux d'Israël." },
  ],
  de: [
    { title: "1. Annahme der Bedingungen", body: "Die Nutzung von MYOUKEE stellt eine vollständige Zustimmung zu diesen Nutzungsbedingungen dar. Wenn Sie nicht zustimmen, stellen Sie bitte die Nutzung der Website ein." },
    { title: "2. Beschreibung des Dienstes", body: "MYOUKEE bietet einen Dienst zur Umwandlung von Songs in Karaoke-Format mittels künstlicher Intelligenz. Der Dienst umfasst:", bullets: ["Musikalische Gesangstrennung (Demucs AI).", "Liedtext-Transkription (Whisper AI).", "Cinematische Karaoke-Videoerstellung.", "Gesangsanalyse und Leistungsbewertung."] },
    { title: "3. Urheberrecht und Inhalte", body: "Sie erklären, dass:", bullets: ["Sie das gesetzliche Recht haben, die hochgeladenen Inhalte zu verwenden.", "Sie keine Inhalte hochladen, die Urheberrechte anderer verletzen.", "Die Nutzung der Ergebnisse nur für den persönlichen Gebrauch bestimmt ist."] },
    { title: "", body: "MYOUKEE ist nicht verantwortlich für die illegale Nutzung urheberrechtlich geschützter Inhalte." },
    { title: "4. Guthaben und Zahlungen", bullets: ["Die ersten 40 Sekunden sind bei jeder Verarbeitung kostenlos.", "Guthaben ist ein Zahlungsmittel und nicht erstattungsfähig.", "Preise können sich mit vorheriger Ankündigung ändern.", "Transaktionen werden sicher über Stripe abgewickelt."] },
    { title: "5. Haftungsbeschränkung", body: "MYOUKEE wird \"WIE BESEHEN\" (AS-IS) bereitgestellt. Wir garantieren keine ununterbrochene Verfügbarkeit und haften nicht für direkte oder indirekte Schäden, die aus der Nutzung des Dienstes entstehen." },
    { title: "6. Verbotene Nutzung", body: "Verboten ist:", bullets: ["Der Versuch, Sicherheitsmechanismen zu umgehen.", "Das Hochladen beleidigender, sexueller, gewalttätiger oder illegaler Inhalte.", "Reverse Engineering des Systems.", "Kommerzielle Nutzung ohne schriftliche Genehmigung."] },
    { title: "7. Kontokündigung", body: "Wir behalten uns das Recht vor, Konten, die gegen diese Bedingungen verstoßen, ohne vorherige Ankündigung zu kündigen." },
    { title: "8. Anwendbares Recht und Gerichtsstand", body: "Diese Bedingungen unterliegen den Gesetzen des Staates Israel. Jeder Rechtsstreit wird vor den Gerichten Israels verhandelt." },
  ],
};

export default function Terms() {
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
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-accent" />
        </div>
        <h1 className="text-3xl font-display font-bold">{t.consent.termsLink}</h1>
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
          </section>
        ))}

        <p className="text-xs text-muted-foreground/50 pt-4 border-t border-white/5">
          MYOUKEE &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
