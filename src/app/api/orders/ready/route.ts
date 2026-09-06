import { NextResponse } from 'next/server';
import { markOrderReady, getOrder } from '@/lib/firebaseDb';
import { sendStatusEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  const { id, orderData, smtpUser, smtpPass } = await (async () => {
    try { return await request.json(); } catch { return {}; }
  })();

  if (!id) {
    return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
  }

  // 1. Update status in database (non-blocking — email still sends even if DB update fails)
  let dbSuccess = false;
  let dbError: string | undefined;
  try {
    await markOrderReady(id);
    dbSuccess = true;
  } catch (err: any) {
    dbError = err.message || 'DB update failed';
    console.error('Failed to mark order ready in DB:', err);
  }

  // 2. Obtain order details to send email notification
  let order = orderData;
  if (!order || !order.email) {
    try {
      order = await getOrder(id);
    } catch (err) {
      console.warn('Could not fetch order from DB for ready email:', err);
    }
  }

  let emailResult: { success: boolean; messageId?: string; error?: any } = {
    success: false,
    error: 'Order details missing',
  };

  if (order && order.email) {
    try {
      emailResult = await sendStatusEmail({
        to: order.email,
        clientName: order.client || 'Valued Customer',
        orderId: id,
        status: 'Ready',
        total: Number(order.total) || 0,
        date: order.date || new Date().toISOString().split('T')[0],
        items: order.items,
        smtpUser,
        smtpPass,
      });
    } catch (emailErr: any) {
      console.error('Failed to send ready status email:', emailErr);
      emailResult = { success: false, error: emailErr.message };
    }
  } else {
    console.warn(`[Orders Ready] No email found for order ${id}, skipping email.`);
  }

  // Return success if at least the DB was updated; email is best-effort
  if (!dbSuccess) {
    return NextResponse.json({
      success: false,
      error: dbError || 'Failed to update order status',
      emailSent: emailResult.success,
    }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: 'Order marked ready successfully',
    emailSent: emailResult.success,
    emailError: emailResult.success ? undefined : emailResult.error,
  });
}
