import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import prismadb from '../../../../lib/prismadb'

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const payload = await req.text(); // Using req.text() to get the raw body
    const headers = {
      'svix-id': req.headers.get('svix-id') as string,
      'svix-timestamp': req.headers.get('svix-timestamp') as string,
      'svix-signature': req.headers.get('svix-signature') as string,
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt;
    try {
      evt = wh.verify(payload, headers);
    } catch (err) {
      console.error('Error verifying webhook:', err);
      return NextResponse.json({ error: 'Error verifying webhook' }, { status: 400 });
    }

    const { id, email_addresses, first_name, last_name } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
      try {
        await prismadb.customer.create({
          data: {
            id: id,
            email: email_addresses[0].email_address,
            firstName: first_name,
            lastName: last_name,
            stripeCustomerId: '',
          },
        });
        
        return NextResponse.json({ message: 'Customer created successfully' });
      } catch (error) {
        console.error('Error creating customer:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Unsupported event type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[Clerk_Webhook_POST]', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
};

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
