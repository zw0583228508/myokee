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

const RECEIPT_I18N: Record<string, {
  subject: string; heading: string; credits: string; amount: string;
  method: string; order: string; thanks: string;
}> = {
  en: {
    subject: "Purchase Confirmation – MYOUKEE",
    heading: "Purchase Confirmation",
    credits: "Credits",
    amount: "Amount",
    method: "Payment Method",
    order: "Order ID",
    thanks: "Thank you for your purchase! Credits have been added to your account.",
  },
  he: {
    subject: "אישור רכישה – MYOUKEE",
    heading: "אישור רכישה",
    credits: "קרדיטים",
    amount: "סכום",
    method: "אמצעי תשלום",
    order: "מספר הזמנה",
    thanks: "תודה על הרכישה! הקרדיטים נוספו לחשבונך.",
  },
  ar: {
    subject: "تأكيد الشراء – MYOUKEE",
    heading: "تأكيد الشراء",
    credits: "الأرصدة",
    amount: "المبلغ",
    method: "طريقة الدفع",
    order: "رقم الطلب",
    thanks: "شكراً لشرائك! تمت إضافة الأرصدة إلى حسابك.",
  },
  ru: {
    subject: "Подтверждение покупки – MYOUKEE",
    heading: "Подтверждение покупки",
    credits: "Кредиты",
    amount: "Сумма",
    method: "Способ оплаты",
    order: "Номер заказа",
    thanks: "Спасибо за покупку! Кредиты добавлены на ваш аккаунт.",
  },
  es: {
    subject: "Confirmación de compra – MYOUKEE",
    heading: "Confirmación de compra",
    credits: "Créditos",
    amount: "Monto",
    method: "Método de pago",
    order: "ID de pedido",
    thanks: "¡Gracias por tu compra! Los créditos se han añadido a tu cuenta.",
  },
  fr: {
    subject: "Confirmation d'achat – MYOUKEE",
    heading: "Confirmation d'achat",
    credits: "Crédits",
    amount: "Montant",
    method: "Mode de paiement",
    order: "N° de commande",
    thanks: "Merci pour votre achat ! Les crédits ont été ajoutés à votre compte.",
  },
  de: {
    subject: "Kaufbestätigung – MYOUKEE",
    heading: "Kaufbestätigung",
    credits: "Credits",
    amount: "Betrag",
    method: "Zahlungsmethode",
    order: "Bestellnr.",
    thanks: "Vielen Dank für Ihren Kauf! Die Credits wurden Ihrem Konto gutgeschrieben.",
  },
  ja: {
    subject: "購入確認 – MYOUKEE",
    heading: "購入確認",
    credits: "クレジット",
    amount: "金額",
    method: "支払い方法",
    order: "注文番号",
    thanks: "ご購入ありがとうございます！クレジットがアカウントに追加されました。",
  },
  zh: {
    subject: "购买确认 – MYOUKEE",
    heading: "购买确认",
    credits: "积分",
    amount: "金额",
    method: "支付方式",
    order: "订单号",
    thanks: "感谢您的购买！积分已添加到您的账户。",
  },
  ko: {
    subject: "구매 확인 – MYOUKEE",
    heading: "구매 확인",
    credits: "크레딧",
    amount: "금액",
    method: "결제 방법",
    order: "주문 번호",
    thanks: "구매해 주셔서 감사합니다! 크레딧이 계정에 추가되었습니다.",
  },
  th: {
    subject: "ยืนยันการซื้อ – MYOUKEE",
    heading: "ยืนยันการซื้อ",
    credits: "เครดิต",
    amount: "จำนวนเงิน",
    method: "วิธีชำระเงิน",
    order: "หมายเลขคำสั่ง",
    thanks: "ขอบคุณสำหรับการซื้อ! เครดิตถูกเพิ่มในบัญชีของคุณแล้ว",
  },
  vi: {
    subject: "Xác nhận mua hàng – MYOUKEE",
    heading: "Xác nhận mua hàng",
    credits: "Tín dụng",
    amount: "Số tiền",
    method: "Phương thức thanh toán",
    order: "Mã đơn hàng",
    thanks: "Cảm ơn bạn đã mua hàng! Tín dụng đã được thêm vào tài khoản.",
  },
  tl: {
    subject: "Kumpirmasyon ng Pagbili – MYOUKEE",
    heading: "Kumpirmasyon ng Pagbili",
    credits: "Mga Credit",
    amount: "Halaga",
    method: "Paraan ng Pagbabayad",
    order: "Order ID",
    thanks: "Salamat sa iyong pagbili! Naidagdag na ang mga credit sa iyong account.",
  },
  id: {
    subject: "Konfirmasi Pembelian – MYOUKEE",
    heading: "Konfirmasi Pembelian",
    credits: "Kredit",
    amount: "Jumlah",
    method: "Metode Pembayaran",
    order: "ID Pesanan",
    thanks: "Terima kasih atas pembelian Anda! Kredit telah ditambahkan ke akun Anda.",
  },
};

export async function sendPurchaseConfirmationEmail(
  to: string,
  details: { credits: number; amount: string; orderId: string; method: string },
  lang: string = "en"
): Promise<void> {
  const t = RECEIPT_I18N[lang] ?? RECEIPT_I18N.en;
  const isRtl = lang === "he" || lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const valueAlign = isRtl ? "left" : "right";

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
          <h2 style="color:#ffffff;font-size:20px;margin:0 0 16px;">${t.heading}</h2>
          <p style="color:#a1a1aa;font-size:14px;margin:0 0 20px;">${t.thanks}</p>
          <table width="100%" cellpadding="8" cellspacing="0" style="background:rgba(255,255,255,0.03);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
            <tr><td style="color:#71717a;font-size:13px;">${t.credits}</td><td style="color:#a78bfa;font-size:16px;font-weight:700;text-align:${valueAlign};">${details.credits}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${t.amount}</td><td style="color:#ffffff;font-size:14px;text-align:${valueAlign};">$${details.amount}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${t.method}</td><td style="color:#ffffff;font-size:14px;text-align:${valueAlign};">${details.method}</td></tr>
            <tr><td style="color:#71717a;font-size:13px;">${t.order}</td><td style="color:#71717a;font-size:11px;text-align:${valueAlign};">${details.orderId}</td></tr>
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
    subject: t.subject,
    html,
  });

  console.log(`[email] Purchase confirmation sent to ${to} (lang=${lang})`);
}
