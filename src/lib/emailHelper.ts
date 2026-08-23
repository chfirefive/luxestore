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
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #6366f1; font-size: 16px;">Rs ${total.toLocaleString()}</td>
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

// ─── EXTERNAL ORDER EMAILS (Marketplace Gateway) ─────────────────────────────

type ExternalEmailType =
  | 'confirmation'
  | 'cancel-to-store'
  | 'cancel-to-customer'
  | 'complaint-to-store'
  | 'complaint-to-customer';

interface ExternalOrderEmailParams {
  type: ExternalEmailType;
  to: string;
  clientName: string;
  orderId: string;
  productTitle: string;
  productUrl: string;
  externalStoreName: string;
  ourPrice: number;
  currency: string;
  date: string;
  reason?: string;
  complaintDetails?: string;
}

export async function sendExternalOrderEmail(params: ExternalOrderEmailParams) {
  const {
    type, to, clientName, orderId, productTitle, productUrl,
    externalStoreName, ourPrice, currency, date, reason, complaintDetails
  } = params;
  const shortId = orderId.slice(-6).toUpperCase();

  let subject = '';
  let html = '';

  const baseStyle = `font-family: Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 12px;`;
  const headerHtml = `<div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px;"><h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">LuxeStore</h1><p style="color: #94a3b8; font-size: 13px; margin: 6px 0 0;">External Marketplace Gateway</p></div>`;
  const productBox = `<div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #334155;margin:20px 0;"><p style="margin:0 0 8px;color:#94a3b8;font-size:13px;">Product</p><a href="${productUrl}" style="color:#6366f1;font-weight:700;font-size:15px;text-decoration:none;">${productTitle}</a><br/><span style="color:#94a3b8;font-size:12px;">via ${externalStoreName}</span></div>`;
  const detailsTable = (rows: [string, string][]) => `<div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #334155;margin:20px 0;"><table style="width:100%;font-size:14px;border-collapse:collapse;">${rows.map(([label, val]) => `<tr><td style="padding:5px 0;color:#94a3b8;">${label}</td><td style="padding:5px 0;font-weight:600;text-align:right;color:#f8fafc;">${val}</td></tr>`).join('')}</table></div>`;
  const footer = `<p style="font-size:12px;color:#64748b;text-align:center;margin-top:24px;border-top:1px solid #334155;padding-top:16px;">LuxeStore External Marketplace Service — Ref #${shortId}</p>`;

  if (type === 'confirmation') {
    subject = `[LuxeStore] External Order Confirmed — Ref #${shortId}`;
    html = `<div style="${baseStyle}">${headerHtml}<h2 style="color:#10b981;text-align:center;font-size:20px;">Order Placed Successfully! 🎉</h2><p>Hello <strong>${clientName}</strong>,</p><p style="color:#94a3b8;line-height:1.7;">We've received your external marketplace order. Our team will source this product from <strong>${externalStoreName}</strong> and keep you updated on every step.</p>${productBox}${detailsTable([['Order Ref', `#${shortId}`], ['Amount Paid', `${currency} ${ourPrice.toLocaleString()}`], ['Date', date], ['Source Store', externalStoreName]])}${footer}</div>`;

  } else if (type === 'cancel-to-store') {
    subject = `Cancellation Request — Order Ref #${shortId} — LuxeStore Customer`;
    html = `<div style="${baseStyle}">${headerHtml}<h2 style="color:#ef4444;text-align:center;font-size:20px;">Cancellation Request ⚠️</h2><p>Dear <strong>${externalStoreName} Support Team</strong>,</p><p style="color:#94a3b8;line-height:1.7;">We are writing on behalf of our customer to request a cancellation for the following order placed through your platform. Please process this cancellation at your earliest convenience.</p>${productBox}${detailsTable([['Our Ref #', `#${shortId}`], ['Customer Name', clientName], ['Order Date', date], ['Reason', reason || 'Customer requested cancellation']])}<p style="color:#94a3b8;font-size:13px;">Please confirm the cancellation at your earliest convenience and arrange a refund if payment was collected.</p>${footer}</div>`;

  } else if (type === 'cancel-to-customer') {
    subject = `[LuxeStore] Cancellation Forwarded — Ref #${shortId}`;
    html = `<div style="${baseStyle}">${headerHtml}<h2 style="color:#ef4444;text-align:center;font-size:20px;">Cancellation Forwarded ✓</h2><p>Hello <strong>${clientName}</strong>,</p><p style="color:#94a3b8;line-height:1.7;">Your cancellation request has been <strong>automatically forwarded</strong> to <strong>${externalStoreName}</strong>. No further action is needed from you. You will receive a separate update from ${externalStoreName} regarding any refund.</p>${productBox}${detailsTable([['Cancellation Ref', `#${shortId}`], ['Forwarded To', `${externalStoreName} Support`], ['Status', 'Auto-Forwarded ✅']])}${footer}</div>`;

  } else if (type === 'complaint-to-store') {
    subject = `Customer Complaint — Order Ref #${shortId} — LuxeStore`;
    html = `<div style="${baseStyle}">${headerHtml}<h2 style="color:#f59e0b;text-align:center;font-size:20px;">Customer Complaint Filed 📢</h2><p>Dear <strong>${externalStoreName} Support Team</strong>,</p><p style="color:#94a3b8;line-height:1.7;">We are forwarding a complaint from our customer regarding a product sourced from your platform. Please investigate and resolve this matter promptly.</p>${productBox}${detailsTable([['Our Ref #', `#${shortId}`], ['Customer', clientName], ['Order Date', date]])}<div style="background:#1e293b;padding:16px;border-radius:8px;border:1px solid #f59e0b;margin:20px 0;"><p style="color:#f59e0b;font-weight:700;margin:0 0 8px;">Complaint Details:</p><p style="color:#f8fafc;line-height:1.7;margin:0;">${complaintDetails}</p></div>${footer}</div>`;

  } else if (type === 'complaint-to-customer') {
    subject = `[LuxeStore] Complaint Received & Forwarded — Ref #${shortId}`;
    html = `<div style="${baseStyle}">${headerHtml}<h2 style="color:#f59e0b;text-align:center;font-size:20px;">Complaint Forwarded ✓</h2><p>Hello <strong>${clientName}</strong>,</p><p style="color:#94a3b8;line-height:1.7;">Your complaint has been <strong>automatically forwarded</strong> to <strong>${externalStoreName}</strong>. Keep your complaint reference number handy: <strong style="color:#6366f1;">#${shortId}</strong>.</p>${productBox}${detailsTable([['Complaint Ref', `#${shortId}`], ['Forwarded To', `${externalStoreName} Support`], ['Status', 'Auto-Forwarded ✅']])}<p style="color:#94a3b8;font-size:13px;">LuxeStore will monitor the resolution. We aim to have this resolved within 3–7 business days.</p>${footer}</div>`;
  }

  // Send using existing SMTP config from env
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from = process.env.SMTP_FROM || user || 'no-reply@luxestore.com';

  if (!host || !user || !pass) {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email', port: 587, secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    const info = await transporter.sendMail({ from: '"LuxeStore" <no-reply@luxestore.com>', to, subject, html });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`✉️ [External Ethereal Email] To: ${to} | Type: ${type} | Preview: ${previewUrl}`);
    return { success: true, previewUrl };
  }

  const transporter = nodemailer.createTransport({
    host, port, secure: port === 465,
    auth: { user, pass }
  });
  await transporter.sendMail({ from, to, subject, html });
  console.log(`✉️ [External Email Sent] To: ${to} | Type: ${type}`);
  return { success: true };
}

