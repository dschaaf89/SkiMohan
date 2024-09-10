import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import prismadb from '../../../../lib/prismadb';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const payload = await req.text(); // Get raw body as text
    const headers = {
      'svix-id': req.headers.get('svix-id') as string,
      'svix-timestamp': req.headers.get('svix-timestamp') as string,
      'svix-signature': req.headers.get('svix-signature') as string,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt;
    try {
      evt = wh.verify(payload, headers); // Verify signature
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
    }

    // Log the full event for debugging purposes
    console.log('Received event:', evt);

    const { id, email_addresses, first_name, last_name } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      // Check that the email exists
      const email = email_addresses?.[0]?.email_address || null;

      if (!email) {
        console.error('No email address found for user:', id);
        return NextResponse.json({ error: 'Missing email address' }, { status: 400 });
      }

      try {
        // Check if the customer already exists by email or id
        const existingCustomer = await prismadb.customer.findUnique({
          where: { email: email },  // Or use 'id' if that's unique
        });

        if (existingCustomer) {
          console.log('Customer already exists:', existingCustomer);
          return NextResponse.json({ message: 'Customer already exists' });
        }

        // If not exists, create a new customer
        await prismadb.customer.create({
          data: {
            id: id,
            email: email,
            firstName: first_name || 'Unknown', // Handle missing first name
            lastName: last_name || 'Unknown',  // Handle missing last name
            stripeCustomerId: '',  // Optional: add Stripe ID logic if needed
          },
        });

        return NextResponse.json({ message: 'Customer created successfully' });
      } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    } else {
      console.error('Unsupported event type:', eventType);
      return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Clerk_Webhook_POST] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
