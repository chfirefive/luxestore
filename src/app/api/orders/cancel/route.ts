import { NextResponse } from 'next/server';
import { cancelOrder, getOrder } from '@/lib/firebaseDb';
import { sendStatusEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const { id, smtpUser, smtpPass } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
    }

    // 1. Update status in database
    await cancelOrder(id);

    // 2. Fetch updated order to send email notification
    try {
      const order = await getOrder(id);
      if (order) {
        await sendStatusEmail({
          to: order.email,
          clientName: order.client,
          orderId: id,
          status: 'Cancelled',
          total: order.total,
          date: order.date,
          smtpUser,
          smtpPass,
        });
      }
    } catch (emailErr) {
      console.error('API succeeded updating DB, but failed sending email:', emailErr);
    }

    return NextResponse.json({ success: true, message: 'Order cancelled successfully' });
  } catch (err: any) {
    console.error('API Error cancelling order:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
