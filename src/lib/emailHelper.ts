import nodemailer from 'nodemailer';

export async function sendStatusEmail({
  to,
  clientName,
  orderId,
  status,
  total,
  date,
  smtpUser,
  smtpPass,
}: {
  to: string;
  clientName: string;
  orderId: string;
  status: 'Ready' | 'Cancelled';
  total: number;
  date: string;
  smtpUser?: string;
  smtpPass?: string;
}) {
  const shortId = orderId.substring(orderId.length - 6).toUpperCase();
  const titleColor = status === 'Ready' ? '#10b981' : '#ef4444';
  const statusText = status === 'Ready' ? 'Confirmed & Ready! 🎉' : 'Cancelled ❌';
  const statusMessage = status === 'Ready'
    ? 'Good news! Your order has been confirmed by the store owner and is prepared for pickup or delivery.'
    : 'We regret to inform you that your order has been cancelled by the store owner. If you have any questions, please contact support.';

  const html = `
    <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 12px;">
      <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">LuxeStore</h1>
      </div>
      
      <h2 style="font-size: 20px; color: ${titleColor}; text-align: center; font-weight: 600; margin-bottom: 20px;">
        Order #${shortId} Status Update: ${statusText}
      </h2>
      
      <p style="font-size: 16px; color: #f8fafc; line-height: 1.6;">
        Hello <strong>${clientName}</strong>,
      </p>
      
      <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">
        ${statusMessage}
      </p>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 8px; border: 1px solid #334155; margin: 25px 0;">
        <h3 style="margin-top: 0; color: #f8fafc; font-size: 16px; border-bottom: 1px solid #334155; padding-bottom: 10px;">Order Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Order Reference:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f8fafc;">#${orderId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Date Placed:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f8fafc;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 15px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #6366f1; font-size: 16px;">$${total.toFixed(2)}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin-top: 30px; border-top: 1px solid #334155; padding-top: 20px;">
        Thank you for choosing LuxeStore.<br/>
        This is an automated status update email notification.
      </p>
    </div>
  `;

  // Get SMTP settings, defaulting to parameters if passed, otherwise using env
  const isCustomSmtp = !!smtpUser && !!smtpPass;
  const host = isCustomSmtp ? 'smtp.gmail.com' : process.env.SMTP_HOST;
  const port = isCustomSmtp ? 465 : parseInt(process.env.SMTP_PORT || '587');
  const user = isCustomSmtp ? smtpUser : process.env.SMTP_USER;
  const pass = isCustomSmtp ? smtpPass : process.env.SMTP_PASS;
  const from = isCustomSmtp ? smtpUser : (process.env.SMTP_FROM || user || 'no-reply@luxestore.com');

  if (!host || !user || !pass) {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });

    const info = await transporter.sendMail({
      from: '"LuxeStore" <no-reply@luxestore.com>',
      to,
      subject: `LuxeStore Order #${shortId} Status Update: ${status}`,
      html
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('✉️ [Ethereal Test Email Sent]');
    console.log(`To: ${to}`);
    console.log(`Subject: LuxeStore Order #${shortId} Status Update: ${status}`);
    console.log(`Preview URL: ${previewUrl}`);
    return { success: true, simulated: false, previewUrl };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass
    }
  });

  await transporter.sendMail({
    from,
    to,
    subject: `LuxeStore Order #${shortId} Status Update: ${status}`,
    html
  });

  console.log(`✉️ [Real Email Sent] To: ${to}`);
  return { success: true, simulated: false };
}
