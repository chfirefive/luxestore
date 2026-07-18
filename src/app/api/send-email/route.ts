import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { to, subject, html } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing to, subject, or html body parameters.' }, { status: 400 });
    }

    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.SMTP_FROM || user || 'no-reply@luxestore.com';

    // If SMTP credentials aren't set, use Ethereal to send a test email!
    if (!host || !user || !pass) {
      try {
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
          subject,
          html
        });

        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log('✉️ [Ethereal Test Email Sent]');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        console.log(`Preview URL: ${previewUrl}`);

        return NextResponse.json({
          success: true,
          simulated: false,
          previewUrl,
          message: `Email sent through Ethereal! Preview at: ${previewUrl}`
        });
      } catch (e: any) {
        console.error('Failed Ethereal fallback, printing local simulation:', e);
        console.log('✉️ [Simulated Email Notification]');
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        return NextResponse.json({
          success: true,
          simulated: true,
          message: 'Ethereal failed. Email simulated in console.'
        });
      }
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
      subject,
      html
    });

    return NextResponse.json({ success: true, message: 'Email sent successfully!' });
  } catch (err: any) {
    console.error('Error sending email notification:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
