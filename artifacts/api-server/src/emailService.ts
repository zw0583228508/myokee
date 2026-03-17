import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || "noreply@myoukee.com";
const FROM_NAME = process.env.SMTP_FROM_NAME || "MYOUKEE";

export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string,
  lang: string = "en"
): Promise<void> {
  const isHebrew = lang === "he";
  const isArabic = lang === "ar";
  const dir = isHebrew || isArabic ? "rtl" : "ltr";

  const subject = isHebrew
    ? "איפוס סיסמה – MYOUKEE"
    : isArabic
      ? "إعادة تعيين كلمة المرور – MYOUKEE"
      : "Password Reset – MYOUKEE";

  const heading = isHebrew ? "איפוס סיסמה" : isArabic ? "إعادة تعيين كلمة المرور" : "Password Reset";
  const bodyText = isHebrew
    ? "קיבלנו בקשה לאיפוס הסיסמה שלך. לחץ על הכפתור למטה כדי לבחור סיסמה חדשה."
    : isArabic
      ? "تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بك. انقر على الزر أدناه لاختيار كلمة مرور جديدة."
      : "We received a request to reset your password. Click the button below to choose a new password.";
  const btnText = isHebrew ? "איפוס סיסמה" : isArabic ? "إعادة تعيين كلمة المرور" : "Reset Password";
  const expiry = isHebrew
    ? "הקישור תקף לשעה אחת בלבד."
    : isArabic
      ? "الرابط صالح لمدة ساعة واحدة فقط."
      : "This link is valid for 1 hour only.";
  const ignore = isHebrew
    ? "אם לא ביקשת איפוס סיסמה, אפשר להתעלם מהמייל הזה."
    : isArabic
      ? "إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني."
      : "If you didn't request a password reset, you can ignore this email.";

  const html = `<!DOCTYPE html>
<html dir="${dir}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#16161f;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:12px;padding:12px;margin-bottom:16px;">
            <span style="font-size:24px;color:white;">🎤</span>
          </div>
          <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;">
            <span style="color:#a78bfa;">MY</span>OUKEE
          </h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px;text-align:center;">
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 12px;">${heading}</h2>
          <p style="color:#a1a1aa;font-size:14px;line-height:1.6;margin:0 0 24px;">${bodyText}</p>
          <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:12px;font-size:16px;font-weight:600;">${btnText}</a>
          <p style="color:#71717a;font-size:12px;margin:20px 0 0;">${expiry}</p>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:#52525b;font-size:12px;margin:0;">${ignore}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  console.log(`[email] Password reset email sent to ${to}`);
}

export async function sendPurchaseConfirmationEmail(
  to: string,
  details: { credits: number; amount: string; orderId: string; method: string },
  lang: string = "en"
): Promise<void> {
  const isHebrew = lang === "he";

  const subject = isHebrew
    ? "אישור רכישה – MYOUKEE"
    : "Purchase Confirmation – MYOUKEE";

  const heading = isHebrew ? "אישור רכישה" : "Purchase Confirmation";
  const creditsLabel = isHebrew ? "קרדיטים" : "Credits";
  const amountLabel = isHebrew ? "סכום" : "Amount";
  const methodLabel = isHebrew ? "אמצעי תשלום" : "Payment Method";
  const orderLabel = isHebrew ? "מספר הזמנה" : "Order ID";
  const thanks = isHebrew
    ? "תודה על הרכישה! הקרדיטים נוספו לחשבונך."
    : "Thank you for your purchase! Credits have been added to your account.";

  const html = `<!DOCTYPE html>
<html dir="${isHebrew ? "rtl" : "ltr"}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#16161f;border-radius:16px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;">
        <tr><td style="padding:32px 32px 24px;text-align:center;">
          <div style="display:inline-block;background:linear-gradient(135deg,#7c3aed,#3b82f6);border-radius:12px;padding:12px;margin-bottom:16px;">
            <span style="font-size:24px;color:white;">🎤</span>
          </div>
          <h1 style="color:#ffffff;font-size:22px;margin:0 0 8px;">
            <span style="color:#a78bfa;">MY</span>OUKEE
          </h1>
        </td></tr>
        <tr><td style="padding:0 32px 24px;text-align:center;">
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">${heading}</h2>
          <p style="color:#a1a1aa;font-size:14px;margin:0 0 20px;">${thanks}</p>
          <table width="100%" cellpadding="8" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="color:#71717a;font-size:13px;">${creditsLabel}</td><td style="color:#a78bfa;font-size:16px;font-weight:700;text-align:${isHebrew ? "left" : "right"};">${details.credits}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${amountLabel}</td><td style="color:#ffffff;font-size:14px;text-align:${isHebrew ? "left" : "right"};">$${details.amount}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${methodLabel}</td><td style="color:#ffffff;font-size:14px;text-align:${isHebrew ? "left" : "right"};">${details.method}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${orderLabel}</td><td style="color:#71717a;font-size:11px;text-align:${isHebrew ? "left" : "right"};">${details.orderId}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 32px 24px;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="color:#52525b;font-size:11px;margin:0;">MYOUKEE © ${new Date().getFullYear()}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
    to,
    subject,
    html,
  });

  console.log(`[email] Purchase confirmation sent to ${to}`);
}
