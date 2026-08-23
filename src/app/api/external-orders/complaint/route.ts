import { NextResponse } from 'next/server';
import { fileExternalOrderComplaint, getExternalOrder } from '@/lib/firebaseDb';
import { sendExternalOrderEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const { id, details } = await request.json();
    if (!id || !details?.trim()) {
      return NextResponse.json({ success: false, error: 'Missing order ID or complaint details' }, { status: 400 });
    }

    // 1. Fetch order
    const order = await getExternalOrder(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    if (order.status === 'Cancelled') {
      return NextResponse.json({ success: false, error: 'Cannot file complaint on a cancelled order' }, { status: 400 });
    }

    // 2. Update Firestore → Complaint + forwardedToExternal: true
    await fileExternalOrderComplaint(id, details.trim());

    // 3. AUTO-EMAIL external store support with full complaint details
    try {
      await sendExternalOrderEmail({
        type: 'complaint-to-store',
        to: order.externalSupportEmail,
        clientName: order.client,
        orderId: id,
        productTitle: order.productTitle,
        productUrl: order.productUrl,
        externalStoreName: order.externalStoreName,
        ourPrice: order.ourPrice,
        currency: order.currency,
        date: order.date,
        complaintDetails: details.trim(),
      });
    } catch (e) {
      console.error('Failed to auto-email external store for complaint:', e);
    }

    // 4. AUTO-EMAIL customer with complaint reference confirmation
    try {
      await sendExternalOrderEmail({
        type: 'complaint-to-customer',
        to: order.email,
        clientName: order.client,
        orderId: id,
        productTitle: order.productTitle,
        productUrl: order.productUrl,
        externalStoreName: order.externalStoreName,
        ourPrice: order.ourPrice,
        currency: order.currency,
        date: order.date,
        complaintDetails: details.trim(),
      });
    } catch (e) {
      console.error('Failed to auto-email customer complaint confirmation:', e);
    }

    return NextResponse.json({
      success: true,
      forwarded: true,
      refNumber: id.slice(-6).toUpperCase(),
      message: 'Complaint filed and automatically forwarded to external store.',
    });
  } catch (err: any) {
    console.error('External order complaint error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
