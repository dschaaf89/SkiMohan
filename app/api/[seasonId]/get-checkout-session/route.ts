import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const session_id = searchParams.get('session_id');

  if (!session_id) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id);
    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Error retrieving session:", error);
    return NextResponse.json({ error: 'Unable to retrieve session details' }, { status: 500 });
  }
}
