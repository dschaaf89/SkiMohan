import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export const config = {
  api: {
    bodyParser: false, // Handle raw body for Stripe webhook
  },
};

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Log the session to verify its structure
    console.log("Stripe Session:", session);

    // Extract the sessionId and other important details
    const sessionId = session.id;
    const transactionId = session.payment_intent as string;  // Payment Intent ID
    const paymentMethod = session.payment_method_types[0];  // Payment method (e.g., 'card')
    const totalAmount = session.amount_total / 100; // Total amount in dollars (Stripe stores in cents)
    const paymentDate = new Date(session.created * 1000).toISOString(); // Payment date

    const orderId = session.metadata?.orderId;  // Extract orderId from metadata

    if (!orderId) {
      return new NextResponse("Order ID is missing from session metadata", { status: 400 });
    }

    // Update the order with sessionId and other payment details
    const updatedOrder = await prismadb.order.update({
      where: {
        id: orderId,
      },
      data: {
        sessionId,  // Save the sessionId in the Order table
        isPaid: true,
        transactionId,  // Store the transaction (Payment Intent) ID
        paymentMethod,  // Store the payment method type (e.g., 'card')
        totalAmount,    // Store the total amount of the order
        paymentDate,    // Store the payment date
        phone: session.customer_details?.phone || "",
        address: `${session.customer_details?.address?.line1}, ${session.customer_details?.address?.city}, ${session.customer_details?.address?.state}, ${session.customer_details?.address?.country}, ${session.customer_details?.address?.postal_code}`,
        Name_First: session.customer_details?.name.split(" ")[0] || "",
        Name_Last: session.customer_details?.name.split(" ").slice(1).join(" ") || ""
      },
    });

    console.log("Order updated with session ID:", updatedOrder);

    return new NextResponse("Payment successful", { status: 200 });
  }

  return new NextResponse(null, { status: 400 });
}
