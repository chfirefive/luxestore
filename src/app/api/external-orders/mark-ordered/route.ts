import { NextResponse } from 'next/server';
import { markExternalOrderOrdered, getExternalOrder } from '@/lib/firebaseDb';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing order ID' }, { status: 400 });
    }

    const order = await getExternalOrder(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    await markExternalOrderOrdered(id);

    return NextResponse.json({ success: true, message: 'Order marked as ordered from external store.' });
  } catch (err: any) {
    console.error('Mark external order ordered error:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
