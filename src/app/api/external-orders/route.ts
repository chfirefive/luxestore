import { NextResponse } from 'next/server';
import { addExternalOrder } from '@/lib/firebaseDb';
import { sendExternalOrderEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      client, email, phone, address, notes,
      productTitle, productUrl, productImageUrl,
      externalStoreName, externalSupportEmail,
      externalPrice, ourPrice, commissionRate, currency,
    } = body;

    if (!client || !email || !phone || !address || !productTitle || !productUrl) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const order = await addExternalOrder({
      client: client.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      address: address.trim(),
      notes: notes?.trim() || '',
      productTitle,
      productUrl,
      productImageUrl: productImageUrl || '',
      externalStoreName: externalStoreName || 'External Store',
      externalSupportEmail: externalSupportEmail || 'support@store.com',
      externalPrice,
      ourPrice,
      commissionRate,
      currency: currency || 'PKR',
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      forwardedToExternal: false,
    });

    // Send confirmation email to customer
    try {
      await sendExternalOrderEmail({
        type: 'confirmation',
        to: email.trim().toLowerCase(),
        clientName: client.trim(),
        orderId: order.id,
        productTitle,
        productUrl,
        externalStoreName: externalStoreName || 'External Store',
        ourPrice,
        currency: currency || 'PKR',
        date: order.date,
      });
    } catch (emailErr) {
      console.error('Confirmation email failed (order still created):', emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (err: any) {
    console.error('External order creation error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
