import { NextResponse } from 'next/server';
import { cleanupExpiredOrders } from '@/lib/firebaseDb';

export async function POST() {
  try {
    const result = await cleanupExpiredOrders();
    return NextResponse.json({
      success: true,
      message: `Cleanup complete. Removed ${result.deletedCancelled} cancelled and ${result.deletedReady} confirmed orders.`,
      ...result
    });
  } catch (err: any) {
    console.error('API Error during order cleanup:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
