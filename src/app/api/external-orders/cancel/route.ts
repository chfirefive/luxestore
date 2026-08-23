import { NextResponse } from 'next/server';
import { cancelExternalOrder, getExternalOrder } from '@/lib/firebaseDb';
import { sendExternalOrderEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const { id, reason } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
    }

    // 1. Fetch order before updating (need emails, product info etc.)
    const order = await getExternalOrder(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Cancelled') {
      return NextResponse.json({ success: false, error: 'Order is already cancelled' }, { status: 400 });
    }

    // 2. Update Firestore → Cancelled + forwardedToExternal: true
    await cancelExternalOrder(id, reason || 'Customer requested cancellation');

    // 3. AUTO-EMAIL the external store's support (fully automatic, no owner needed)
    try {
      await sendExternalOrderEmail({
        type: 'cancel-to-store',
        to: order.externalSupportEmail,
        clientName: order.client,
        orderId: id,
        productTitle: order.productTitle,
        productUrl: order.productUrl,
        externalStoreName: order.externalStoreName,
        ourPrice: order.ourPrice,
        currency: order.currency,
        date: order.date,
        reason: reason || 'Customer requested cancellation',
      });
    } catch (e) {
      console.error('Failed to auto-email external store for cancellation:', e);
    }

    // 4. AUTO-EMAIL the customer confirming the cancellation was forwarded
    try {
      await sendExternalOrderEmail({
        type: 'cancel-to-customer',
        to: order.email,
        clientName: order.client,
        orderId: id,
        productTitle: order.productTitle,
        productUrl: order.productUrl,
        externalStoreName: order.externalStoreName,
        ourPrice: order.ourPrice,
        currency: order.currency,
        date: order.date,
        reason: reason || 'Customer requested cancellation',
      });
    } catch (e) {
      console.error('Failed to auto-email customer cancellation confirmation:', e);
    }

    return NextResponse.json({ success: true, forwarded: true, message: 'Order cancelled and automatically forwarded to external store.' });
  } catch (err: any) {
    console.error('External order cancel error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
