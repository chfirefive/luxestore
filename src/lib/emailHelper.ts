import nodemailer from 'nodemailer';

function cleanEnv(val?: string): string {
  return (val || '').replace(/^["']|["']$/g, '').trim();
}

export function getSmtpConfig(customUser?: string, customPass?: string) {
  const user = cleanEnv(customUser) || cleanEnv(process.env.SMTP_USER);
  const pass = cleanEnv(customPass) || cleanEnv(process.env.SMTP_PASS);
  const host = cleanEnv(process.env.SMTP_HOST) || 'smtp.gmail.com';
  const port = parseInt(cleanEnv(process.env.SMTP_PORT) || '465', 10);
  const from = cleanEnv(process.env.SMTP_FROM) || (user ? `LuxeStore <${user}>` : 'no-reply@luxestore.com');

  return { host, port, user, pass, from };
}

export async function createTransporter(customUser?: string, customPass?: string) {
  const { host, port, user, pass } = getSmtpConfig(customUser, customPass);

  if (!user || !pass) {
    console.warn('⚠️ [Email] SMTP credentials not found in env or parameters. Trying Ethereal fallback...');
    try {
      const testAccount = await nodemailer.createTestAccount();
      return {
        transporter: nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass }
        }),
        from: '"LuxeStore" <no-reply@luxestore.com>',
        isFallback: true
      };
    } catch (e) {
      console.error('Failed to create Ethereal fallback account:', e);
      return null;
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false
    }
  });

  return {
    transporter,
    from: cleanEnv(process.env.SMTP_FROM) || `LuxeStore <${user}>`,
    isFallback: false
  };
}

// ─── 1. ORDER PLACEMENT CONFIRMATION EMAIL ───────────────────────────────────

export interface OrderPlacementEmailParams {
  orderId: string;
  clientName: string;
  to: string;
  phone: string;
  address: string;
  items: Array<{ productId: string | number; name: string; price: number; qty: number; imageUrl?: string }>;
  total: number;
  notes?: string;
  date: string;
}

export async function sendOrderPlacementEmail(params: OrderPlacementEmailParams) {
  const { orderId, clientName, to, phone, address, items, total, notes, date } = params;
  const shortId = orderId.slice(-6).toUpperCase();

  const itemsRows = items.map(item => `
    <tr style="border-bottom: 1px solid #334155;">
      <td style="padding: 10px 0; color: #f8fafc; font-weight: 500;">
        ${item.name}
        <div style="font-size: 12px; color: #94a3b8;">Qty: ${item.qty} × PKR ${item.price.toLocaleString()}</div>
      </td>
      <td style="padding: 10px 0; text-align: right; color: #6366f1; font-weight: 700;">
        PKR ${(item.price * item.qty).toLocaleString()}
      </td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 14px;">
      <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 24px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 1px;">LuxeStore</h1>
        <p style="color: #94a3b8; font-size: 13px; margin: 4px 0 0;">Premium Luxury &amp; Everyday Goods</p>
      </div>

      <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 10px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <h2 style="color: #10b981; margin: 0 0 6px; font-size: 20px; font-weight: 700;">🎉 Order Placed Successfully!</h2>
        <p style="color: #cbd5e1; margin: 0; font-size: 14px;">Thank you, <strong>${clientName}</strong>. Your order has been received and is being prepared.</p>
      </div>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #334155; margin-bottom: 24px;">
        <h3 style="margin-top: 0; color: #f8fafc; font-size: 15px; border-bottom: 1px solid #334155; padding-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">Order Summary</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse; margin-bottom: 12px;">
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Order Reference:</td>
            <td style="padding: 5px 0; font-weight: 700; text-align: right; color: #f8fafc;">#${shortId}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Order Date:</td>
            <td style="padding: 5px 0; font-weight: 600; text-align: right; color: #f8fafc;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Payment Method:</td>
            <td style="padding: 5px 0; font-weight: 600; text-align: right; color: #10b981;">Cash on Delivery (COD)</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Delivery Address:</td>
            <td style="padding: 5px 0; font-weight: 600; text-align: right; color: #f8fafc; max-width: 300px;">${address}</td>
          </tr>
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Contact Phone:</td>
            <td style="padding: 5px 0; font-weight: 600; text-align: right; color: #f8fafc;">${phone}</td>
          </tr>
          ${notes ? `
          <tr>
            <td style="padding: 5px 0; color: #94a3b8;">Special Notes:</td>
            <td style="padding: 5px 0; font-weight: 500; font-style: italic; text-align: right; color: #f59e0b;">${notes}</td>
          </tr>` : ''}
        </table>

        <h3 style="margin: 16px 0 8px; color: #f8fafc; font-size: 14px; border-bottom: 1px solid #334155; padding-bottom: 6px;">Items in Your Order</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          ${itemsRows}
          <tr>
            <td style="padding: 12px 0 0; color: #f8fafc; font-size: 16px; font-weight: 700;">Total Amount:</td>
            <td style="padding: 12px 0 0; font-weight: 800; text-align: right; color: #6366f1; font-size: 18px;">PKR ${total.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 24px 0 0; border-top: 1px solid #334155; padding-top: 18px; line-height: 1.6;">
        If you have any questions or need to modify your order, please contact support at <a href="mailto:furqanshahbaz112233@gmail.com" style="color: #6366f1; text-decoration: none;">furqanshahbaz112233@gmail.com</a>.<br/>
        &copy; LuxeStore. All rights reserved.
      </p>
    </div>
  `;

  const setup = await createTransporter();
  if (!setup) {
    console.error('Could not obtain email transporter for order confirmation');
    return { success: false, error: 'Email transporter unavailable' };
  }

  try {
    const info = await setup.transporter.sendMail({
      from: setup.from,
      to,
      subject: `[LuxeStore] Order Confirmed! #${shortId}`,
      html,
    });

    console.log(`✉️ [Order Confirmation Email Sent] To: ${to} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send order placement confirmation email:', err);
    return { success: false, error: err.message };
  }
}

// ─── 2. STATUS UPDATE EMAIL (Ready / Confirmed by Owner OR Cancelled) ─────────

export async function sendStatusEmail({
  to,
  clientName,
  orderId,
  status,
  total,
  date,
  reason,
  items,
  smtpUser,
  smtpPass,
}: {
  to: string;
  clientName: string;
  orderId: string;
  status: 'Ready' | 'Cancelled';
  total: number;
  date: string;
  reason?: string;
  items?: Array<{ name: string; qty: number; price: number }>;
  smtpUser?: string;
  smtpPass?: string;
}) {
  const shortId = orderId.substring(orderId.length - 6).toUpperCase();
  const isReady = status === 'Ready';
  const titleColor = isReady ? '#10b981' : '#ef4444';
  const statusText = isReady ? 'Confirmed & Ready for Delivery! 🎉' : 'Order Cancelled ❌';
  const statusMessage = isReady
    ? 'Good news! Your order has been confirmed by the store owner and is prepared for pickup or dispatch to your address.'
    : (reason ? `Your order has been cancelled: "${reason}". If this was a mistake, please reach out to us.` : 'We regret to inform you that your order has been cancelled. If you have any questions or require assistance, please contact support.');

  const itemsHtml = items && items.length > 0 ? `
    <div style="margin-top: 14px; border-top: 1px solid #334155; padding-top: 10px;">
      <p style="margin: 0 0 6px; font-size: 13px; color: #94a3b8; font-weight: 600;">Items:</p>
      ${items.map(i => `<div style="font-size: 13px; color: #cbd5e1; margin-bottom: 4px;">• ${i.name} × ${i.qty} — PKR ${(i.price * i.qty).toLocaleString()}</div>`).join('')}
    </div>
  ` : '';

  const html = `
    <div style="font-family: Arial, -apple-system, BlinkMacSystemFont, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border: 1px solid #334155; border-radius: 14px;">
      <div style="text-align: center; border-bottom: 1px solid #334155; padding-bottom: 20px; margin-bottom: 20px;">
        <h1 style="color: #6366f1; margin: 0; font-size: 24px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">LuxeStore</h1>
      </div>
      
      <h2 style="font-size: 20px; color: ${titleColor}; text-align: center; font-weight: 700; margin-bottom: 16px;">
        Order #${shortId} Status Update: ${statusText}
      </h2>
      
      <p style="font-size: 15px; color: #f8fafc; line-height: 1.6;">
        Hello <strong>${clientName}</strong>,
      </p>
      
      <p style="font-size: 14px; color: #cbd5e1; line-height: 1.6;">
        ${statusMessage}
      </p>

      <div style="background-color: #1e293b; padding: 20px; border-radius: 10px; border: 1px solid #334155; margin: 24px 0;">
        <h3 style="margin-top: 0; color: #f8fafc; font-size: 15px; border-bottom: 1px solid #334155; padding-bottom: 8px;">Order Details</h3>
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Order Reference:</td>
            <td style="padding: 6px 0; font-weight: 700; text-align: right; color: #f8fafc;">#${shortId}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Date Placed:</td>
            <td style="padding: 6px 0; font-weight: 600; text-align: right; color: #f8fafc;">${date}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8; font-size: 15px; font-weight: bold;">Total Amount:</td>
            <td style="padding: 6px 0; font-weight: bold; text-align: right; color: #6366f1; font-size: 16px;">PKR ${total.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 6px 0; color: #94a3b8;">Status:</td>
            <td style="padding: 6px 0; font-weight: 700; text-align: right; color: ${titleColor};">${status}</td>
          </tr>
        </table>
        ${itemsHtml}
      </div>

      <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px;">
        Thank you for choosing LuxeStore.<br/>
        This is an automated status update notification.
      </p>
    </div>
  `;

  const setup = await createTransporter(smtpUser, smtpPass);
  if (!setup) {
    console.error('Transporter setup failed for status update email');
    return { success: false, error: 'Transporter setup failed' };
  }

  try {
    const info = await setup.transporter.sendMail({
      from: setup.from,
      to,
      subject: `[LuxeStore] Order #${shortId} Status: ${isReady ? 'Confirmed & Ready' : 'Cancelled'}`,
      html,
    });

    console.log(`✉️ [Status Email Sent] To: ${to} | Status: ${status} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error('Failed to send status update email:', err);
    return { success: false, error: err.message };
  }
}

// ─── 3. EXTERNAL MARKETPLACE ORDER EMAILS ─────────────────────────────────────

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

  const setup = await createTransporter();
  if (!setup) {
    return { success: false, error: 'Transporter setup failed' };
  }

  try {
    const info = await setup.transporter.sendMail({
      from: setup.from,
      to,
      subject,
      html,
    });
    console.log(`✉️ [External Order Email Sent] To: ${to} | Type: ${type} | ID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error(`Failed to send external email (Type: ${type}, To: ${to}):`, err);
    return { success: false, error: err.message };
  }
}
