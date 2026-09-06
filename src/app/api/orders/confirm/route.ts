import { NextResponse } from 'next/server';
import { sendOrderPlacementEmail } from '@/lib/emailHelper';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, clientName, to, phone, address, items, total, notes, date } = body;

    if (!orderId || !to || !clientName) {
      return NextResponse.json(
        { success: false, error: 'Missing required order fields (orderId, to, clientName)' },
        { status: 400 }
      );
    }

    const emailResult = await sendOrderPlacementEmail({
      orderId,
      clientName,
      to: to.trim().toLowerCase(),
      phone: phone || '',
      address: address || '',
      items: Array.isArray(items) ? items : [],
      total: Number(total) || 0,
      notes: notes || '',
      date: date || new Date().toISOString().split('T')[0],
    });

    return NextResponse.json({
      success: emailResult.success,
      messageId: emailResult.messageId,
      error: emailResult.error,
    });
  } catch (err: any) {
    console.error('API Error sending order confirmation email:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
