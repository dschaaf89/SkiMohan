import { stripe } from '@/lib/stripe'; // Configured Stripe instance
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { sessionId: string } }) {
  try {
    const body = await req.json();
    const { sessionId } = body;

    // Log the sessionId to ensure it's passed correctly
    console.log("Session ID from body:", sessionId);

    if (!sessionId) {
      console.log("Session ID is missing.");
      return new NextResponse('Session ID is required', { status: 400 });
    }

    // Retrieve the Stripe checkout session using the session ID
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    // Log the session object to see what's inside
    console.log("Stripe Session Retrieved:", session);

    // Optionally, retrieve the PaymentIntent if needed
    const paymentIntent = session.payment_intent 
      ? await stripe.paymentIntents.retrieve(session.payment_intent as string) 
      : null;

    // Log the PaymentIntent if it's available
    if (paymentIntent) {
      console.log("Payment Intent Retrieved:", paymentIntent);
    } else {
      console.log("No Payment Intent found for this session.");
    }

    return NextResponse.json({
      session,
      paymentIntent,
    });
  } catch (error) {
    // Log the error for debugging
    console.error('[STRIPE_SESSION_RETRIEVE_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
