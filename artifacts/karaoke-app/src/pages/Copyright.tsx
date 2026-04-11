import { Link } from "wouter";
import { ArrowLeft, Scale } from "lucide-react";
import { useLang, SupportedLang } from "@/contexts/LanguageContext";

interface Section {
  title: string;
  body?: string;
  bullets?: string[];
}

const content: Partial<Record<SupportedLang, Section[]>> = {
  he: [
    { title: "1. עמידה בזכויות יוצרים", body: "MYOUKEE מכבדת את הקניין הרוחני של אחרים ומצפה מהמשתמשים לעשות את אותו הדבר. השירות שלנו מעבד תוכן שהועלה על ידי המשתמשים, ואנו פועלים בהתאם לחוק זכויות יוצרים בעידן הדיגיטלי של ארצות הברית (DMCA) ולחוקים דומים ברחבי העולם." },
    { title: "2. אחריות המשתמש", body: "בהעלאת תוכן ל-MYOUKEE, אתה מצהיר ומתחייב כי:", bullets: ["יש לך את הבעלות או שקיבלת אישור מפורש מבעל הזכויות להשתמש בתוכן.", "השימוש בתוכן אינו מפר זכויות יוצרים, סימן מסחרי או זכות קניין רוחני אחרת של צד שלישי.", "אתה מודע לכך שעיבוד והפרדת שירים מוגנים עשויים להיות כפופים להגבלות זכויות יוצרים."] },
    { title: "3. הליך הודעת הסרה (DMCA Takedown)", body: "אם אתה בעל זכויות יוצרים ומאמין שתוכן ב-MYOUKEE מפר את זכויותיך, שלח הודעת הסרה הכוללת:", bullets: ["זיהוי היצירה המוגנת שלפי טענתך הופרה.", "זיהוי התוכן המפר באתר שלנו.", "פרטי הקשר שלך (שם, כתובת, טלפון, דוא\"ל).", "הצהרה בתום לב שהשימוש בתוכן לא אושר על ידי בעל הזכויות.", "הצהרה בשבועה שהמידע בהודעה מדויק ושאתה בעל הזכויות או מורשה לפעול בשמו."] },
    { title: "4. הודעת נגד (Counter-Notification)", body: "אם אתה מאמין שתוכן שלך הוסר בטעות, תוכל לשלוח הודעת נגד הכוללת:", bullets: ["זיהוי התוכן שהוסר ומיקומו לפני ההסרה.", "הצהרה בשבועה שהתוכן הוסר בטעות.", "הסכמה לסמכות השיפוט ומידע ליצירת קשר."] },
    { title: "5. מדיניות מפרים חוזרים", body: "MYOUKEE שומרת לעצמה את הזכות לבטל את חשבונם של משתמשים שמפרים זכויות יוצרים באופן חוזר. אנו עשויים להסיר את הגישה לשירותים לכל משתמש שנקבע שהוא מפר חוזר." },
    { title: "6. יצירת קשר", body: "לכל שאלה בנושא זכויות יוצרים או הודעות DMCA, ניתן לפנות אלינו בכתובת: windot100@gmail.com" },
  ],
  en: [
    { title: "1. Copyright Compliance", body: "MYOUKEE respects the intellectual property of others and expects its users to do the same. Our service processes user-uploaded content, and we operate in accordance with the United States Digital Millennium Copyright Act (DMCA) and similar laws worldwide." },
    { title: "2. User Responsibility", body: "By uploading content to MYOUKEE, you represent and warrant that:", bullets: ["You own or have obtained explicit permission from the rights holder to use the content.", "Your use of the content does not infringe any copyright, trademark, or other intellectual property right of any third party.", "You are aware that processing and separating copyrighted songs may be subject to copyright restrictions."] },
    { title: "3. DMCA Takedown Process", body: "If you are a copyright owner and believe that content on MYOUKEE infringes your rights, please submit a takedown notice that includes:", bullets: ["Identification of the copyrighted work you claim has been infringed.", "Identification of the infringing content on our site.", "Your contact information (name, address, phone number, email).", "A good faith statement that the use of the content is not authorized by the rights holder.", "A statement under penalty of perjury that the information in the notice is accurate and that you are the rights holder or authorized to act on their behalf."] },
    { title: "4. Counter-Notification", body: "If you believe your content was removed by mistake, you may submit a counter-notification that includes:", bullets: ["Identification of the removed content and its location prior to removal.", "A statement under penalty of perjury that the content was removed in error.", "Consent to jurisdiction and contact information."] },
    { title: "5. Repeat Infringer Policy", body: "MYOUKEE reserves the right to terminate the accounts of users who repeatedly infringe copyrights. We may remove access to services for any user determined to be a repeat infringer." },
    { title: "6. Contact Information", body: "For any copyright questions or DMCA notices, please contact us at: windot100@gmail.com" },
  ],
  ar: [
    { title: "1. الامتثال لحقوق النشر", body: "تحترم MYOUKEE الملكية الفكرية للآخرين وتتوقع من مستخدميها أن يفعلوا الشيء نفسه. تعالج خدمتنا المحتوى الذي يرفعه المستخدمون، ونعمل وفقًا لقانون الألفية الرقمية لحقوق النشر (DMCA) والقوانين المماثلة في جميع أنحاء العالم." },
    { title: "2. مسؤولية المستخدم", body: "برفع المحتوى إلى MYOUKEE، فإنك تقر وتضمن أن:", bullets: ["لديك ملكية أو حصلت على إذن صريح من صاحب الحقوق لاستخدام المحتوى.", "استخدامك للمحتوى لا ينتهك أي حقوق نشر أو علامة تجارية أو حق ملكية فكرية آخر لأي طرف ثالث.", "أنت على علم بأن معالجة وفصل الأغاني المحمية بحقوق النشر قد تخضع لقيود حقوق النشر."] },
    { title: "3. عملية إشعار الإزالة (DMCA Takedown)", body: "إذا كنت مالك حقوق نشر وتعتقد أن محتوى في MYOUKEE ينتهك حقوقك، يرجى تقديم إشعار إزالة يتضمن:", bullets: ["تحديد العمل المحمي بحقوق النشر الذي تدعي انتهاكه.", "تحديد المحتوى المنتهك على موقعنا.", "معلومات الاتصال الخاصة بك (الاسم، العنوان، الهاتف، البريد الإلكتروني).", "بيان حسن النية بأن استخدام المحتوى غير مصرح به من قبل صاحب الحقوق.", "بيان تحت طائلة شهادة الزور بأن المعلومات في الإشعار دقيقة وأنك صاحب الحقوق أو مخول بالتصرف نيابة عنه."] },
    { title: "4. الإخطار المضاد", body: "إذا كنت تعتقد أن المحتوى الخاص بك تمت إزالته بالخطأ، يمكنك تقديم إخطار مضاد يتضمن:", bullets: ["تحديد المحتوى الذي تمت إزالته وموقعه قبل الإزالة.", "بيان تحت طائلة شهادة الزور بأن المحتوى تمت إزالته بالخطأ.", "الموافقة على الاختصاص القضائي ومعلومات الاتصال."] },
    { title: "5. سياسة المخالفين المتكررين", body: "تحتفظ MYOUKEE بالحق في إنهاء حسابات المستخدمين الذين ينتهكون حقوق النشر بشكل متكرر. قد نزيل الوصول إلى الخدمات لأي مستخدم يُحدد أنه منتهك متكرر." },
    { title: "6. معلومات الاتصال", body: "لأي أسئلة حول حقوق النشر أو إشعارات DMCA، يرجى الاتصال بنا على: windot100@gmail.com" },
  ],
  ru: [
    { title: "1. Соблюдение авторских прав", body: "MYOUKEE уважает интеллектуальную собственность других и ожидает того же от своих пользователей. Наш сервис обрабатывает контент, загруженный пользователями, и мы работаем в соответствии с Законом об авторском праве в цифровую эпоху (DMCA) и аналогичными законами по всему миру." },
    { title: "2. Ответственность пользователя", body: "Загружая контент в MYOUKEE, вы заявляете и гарантируете, что:", bullets: ["Вы являетесь владельцем или получили явное разрешение от правообладателя на использование контента.", "Ваше использование контента не нарушает авторские права, товарный знак или иное право интеллектуальной собственности третьих лиц.", "Вы осознаёте, что обработка и разделение защищённых авторским правом песен может быть предметом ограничений."] },
    { title: "3. Процедура уведомления об удалении (DMCA Takedown)", body: "Если вы являетесь правообладателем и считаете, что контент в MYOUKEE нарушает ваши права, направьте уведомление об удалении, включающее:", bullets: ["Идентификацию произведения, защищённого авторским правом, которое, по вашему мнению, было нарушено.", "Идентификацию нарушающего контента на нашем сайте.", "Вашу контактную информацию (имя, адрес, телефон, email).", "Заявление о добросовестности о том, что использование контента не было разрешено правообладателем.", "Заявление под присягой о том, что информация в уведомлении точна и что вы являетесь правообладателем или уполномочены действовать от его имени."] },
    { title: "4. Встречное уведомление", body: "Если вы считаете, что ваш контент был удалён по ошибке, вы можете направить встречное уведомление, включающее:", bullets: ["Идентификацию удалённого контента и его расположение до удаления.", "Заявление под присягой о том, что контент был удалён по ошибке.", "Согласие на юрисдикцию и контактную информацию."] },
    { title: "5. Политика в отношении повторных нарушителей", body: "MYOUKEE оставляет за собой право удалять аккаунты пользователей, систематически нарушающих авторские права. Мы можем ограничить доступ к сервисам для любого пользователя, признанного повторным нарушителем." },
    { title: "6. Контактная информация", body: "По всем вопросам, связанным с авторскими правами или уведомлениями DMCA, свяжитесь с нами: windot100@gmail.com" },
  ],
  es: [
    { title: "1. Cumplimiento de Derechos de Autor", body: "MYOUKEE respeta la propiedad intelectual de otros y espera que sus usuarios hagan lo mismo. Nuestro servicio procesa contenido subido por los usuarios, y operamos de acuerdo con la Ley de Derechos de Autor del Milenio Digital (DMCA) y leyes similares en todo el mundo." },
    { title: "2. Responsabilidad del Usuario", body: "Al subir contenido a MYOUKEE, usted declara y garantiza que:", bullets: ["Es propietario o ha obtenido permiso explícito del titular de los derechos para usar el contenido.", "Su uso del contenido no infringe ningún derecho de autor, marca registrada u otro derecho de propiedad intelectual de terceros.", "Es consciente de que el procesamiento y la separación de canciones protegidas por derechos de autor pueden estar sujetos a restricciones."] },
    { title: "3. Proceso de Notificación de Eliminación (DMCA Takedown)", body: "Si es titular de derechos de autor y cree que el contenido en MYOUKEE infringe sus derechos, envíe una notificación de eliminación que incluya:", bullets: ["Identificación de la obra protegida por derechos de autor que alega ha sido infringida.", "Identificación del contenido infractor en nuestro sitio.", "Su información de contacto (nombre, dirección, teléfono, correo electrónico).", "Una declaración de buena fe de que el uso del contenido no está autorizado por el titular de los derechos.", "Una declaración bajo pena de perjurio de que la información en la notificación es precisa y que usted es el titular de los derechos o está autorizado a actuar en su nombre."] },
    { title: "4. Contra-Notificación", body: "Si cree que su contenido fue eliminado por error, puede enviar una contra-notificación que incluya:", bullets: ["Identificación del contenido eliminado y su ubicación antes de la eliminación.", "Una declaración bajo pena de perjurio de que el contenido fue eliminado por error.", "Consentimiento a la jurisdicción e información de contacto."] },
    { title: "5. Política de Infractores Reincidentes", body: "MYOUKEE se reserva el derecho de cancelar las cuentas de usuarios que infrinjan repetidamente los derechos de autor. Podemos eliminar el acceso a los servicios para cualquier usuario que se determine como infractor reincidente." },
    { title: "6. Información de Contacto", body: "Para cualquier pregunta sobre derechos de autor o notificaciones DMCA, contáctenos en: windot100@gmail.com" },
  ],
  fr: [
    { title: "1. Conformité au Droit d'Auteur", body: "MYOUKEE respecte la propriété intellectuelle d'autrui et attend de ses utilisateurs qu'ils fassent de même. Notre service traite le contenu téléchargé par les utilisateurs, et nous opérons conformément au Digital Millennium Copyright Act (DMCA) et aux lois similaires dans le monde entier." },
    { title: "2. Responsabilité de l'Utilisateur", body: "En téléchargeant du contenu sur MYOUKEE, vous déclarez et garantissez que :", bullets: ["Vous êtes propriétaire ou avez obtenu l'autorisation explicite du titulaire des droits pour utiliser le contenu.", "Votre utilisation du contenu ne viole aucun droit d'auteur, marque déposée ou autre droit de propriété intellectuelle de tiers.", "Vous êtes conscient que le traitement et la séparation de chansons protégées par le droit d'auteur peuvent être soumis à des restrictions."] },
    { title: "3. Procédure de Notification de Retrait (DMCA Takedown)", body: "Si vous êtes titulaire de droits d'auteur et pensez que du contenu sur MYOUKEE enfreint vos droits, veuillez soumettre une notification de retrait comprenant :", bullets: ["L'identification de l'œuvre protégée que vous estimez avoir été enfreinte.", "L'identification du contenu contrefaisant sur notre site.", "Vos coordonnées (nom, adresse, téléphone, e-mail).", "Une déclaration de bonne foi indiquant que l'utilisation du contenu n'est pas autorisée par le titulaire des droits.", "Une déclaration sous serment que les informations contenues dans la notification sont exactes et que vous êtes le titulaire des droits ou autorisé à agir en son nom."] },
    { title: "4. Contre-Notification", body: "Si vous pensez que votre contenu a été retiré par erreur, vous pouvez soumettre une contre-notification comprenant :", bullets: ["L'identification du contenu retiré et son emplacement avant le retrait.", "Une déclaration sous serment que le contenu a été retiré par erreur.", "Le consentement à la juridiction et les coordonnées."] },
    { title: "5. Politique Relative aux Contrevenants Récidivistes", body: "MYOUKEE se réserve le droit de résilier les comptes des utilisateurs qui enfreignent de manière répétée les droits d'auteur. Nous pouvons retirer l'accès aux services pour tout utilisateur identifié comme contrevenant récidiviste." },
    { title: "6. Informations de Contact", body: "Pour toute question relative aux droits d'auteur ou aux notifications DMCA, veuillez nous contacter à : windot100@gmail.com" },
  ],
  de: [
    { title: "1. Urheberrechts-Konformität", body: "MYOUKEE respektiert das geistige Eigentum anderer und erwartet dasselbe von seinen Nutzern. Unser Dienst verarbeitet von Nutzern hochgeladene Inhalte, und wir handeln in Übereinstimmung mit dem Digital Millennium Copyright Act (DMCA) und ähnlichen Gesetzen weltweit." },
    { title: "2. Verantwortung des Nutzers", body: "Durch das Hochladen von Inhalten auf MYOUKEE erklären und garantieren Sie, dass:", bullets: ["Sie Eigentümer sind oder eine ausdrückliche Genehmigung des Rechteinhabers zur Nutzung des Inhalts erhalten haben.", "Ihre Nutzung des Inhalts keine Urheberrechte, Markenrechte oder sonstige geistige Eigentumsrechte Dritter verletzt.", "Sie sich bewusst sind, dass die Verarbeitung und Trennung urheberrechtlich geschützter Songs Urheberrechtsbeschränkungen unterliegen kann."] },
    { title: "3. DMCA-Takedown-Verfahren", body: "Wenn Sie Urheberrechtsinhaber sind und glauben, dass Inhalte auf MYOUKEE Ihre Rechte verletzen, senden Sie bitte eine Takedown-Benachrichtigung, die Folgendes enthält:", bullets: ["Identifizierung des urheberrechtlich geschützten Werks, das Ihrer Meinung nach verletzt wurde.", "Identifizierung des verletzenden Inhalts auf unserer Website.", "Ihre Kontaktdaten (Name, Adresse, Telefon, E-Mail).", "Eine Erklärung in gutem Glauben, dass die Nutzung des Inhalts nicht vom Rechteinhaber genehmigt wurde.", "Eine eidesstattliche Erklärung, dass die Informationen in der Benachrichtigung korrekt sind und dass Sie der Rechteinhaber sind oder berechtigt sind, in seinem Namen zu handeln."] },
    { title: "4. Gegenbenachrichtigung", body: "Wenn Sie glauben, dass Ihr Inhalt irrtümlich entfernt wurde, können Sie eine Gegenbenachrichtigung einreichen, die Folgendes enthält:", bullets: ["Identifizierung des entfernten Inhalts und seines Standorts vor der Entfernung.", "Eine eidesstattliche Erklärung, dass der Inhalt irrtümlich entfernt wurde.", "Zustimmung zur Gerichtsbarkeit und Kontaktinformationen."] },
    { title: "5. Richtlinie für Wiederholungstäter", body: "MYOUKEE behält sich das Recht vor, die Konten von Nutzern zu kündigen, die wiederholt Urheberrechte verletzen. Wir können den Zugang zu Diensten für jeden Nutzer entfernen, der als Wiederholungstäter identifiziert wird." },
    { title: "6. Kontaktinformationen", body: "Bei Fragen zum Urheberrecht oder DMCA-Benachrichtigungen kontaktieren Sie uns bitte unter: windot100@gmail.com" },
  ],
};

export default function Copyright() {
  const { lang, t } = useLang();
  const isRtl = t.dir === "rtl";
  const sections = content[lang] ?? content["en"]!;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-12" dir={t.dir}>
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/70 mb-8 transition-colors">
        <ArrowLeft className={`w-4 h-4 ${isRtl ? "rotate-180" : ""}`} />
        {t.nav.createKaraoke}
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
          <Scale className="w-5 h-5 text-orange-500" />
        </div>
        <h1 className="text-3xl font-display font-bold">{t.consent.copyrightLink}</h1>
      </div>

      <div className="prose prose-invert prose-sm max-w-none space-y-6 text-white/30 leading-relaxed">
        {sections.map((s, i) => (
          <section key={i}>
            {s.title && <h2 className="text-white text-lg font-semibold mb-2">{s.title}</h2>}
            {s.body && (
              <p>
                {s.body.includes("windot100@gmail.com") ? (
                  <>
                    {s.body.split("windot100@gmail.com")[0]}
                    <a href="mailto:windot100@gmail.com" className="text-primary hover:underline">windot100@gmail.com</a>
                    {s.body.split("windot100@gmail.com")[1]}
                  </>
                ) : s.body}
              </p>
            )}
            {s.bullets && (
              <ul className="list-disc list-inside space-y-1 mt-2">
                {s.bullets.map((b, j) => <li key={j}>{b}</li>)}
              </ul>
            )}
          </section>
        ))}

        <p className="text-xs text-white/20 pt-4 border-t border-white/5">
          MYOUKEE &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
