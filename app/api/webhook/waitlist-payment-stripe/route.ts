import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

export async function POST(req: Request) {
  const body = await req.text(); // Read the raw request body
  const signature = headers().get("Stripe-Signature") as string; // Get the signature header

  let event: Stripe.Event;

  try {
    // Verify the event using your Stripe webhook secret
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WAITLIST_WEBHOOK_SECRET! // Your webhook secret from Stripe
    );
  } catch (error: any) {
    console.error("Webhook Error: ", error.message); // Log the exact error for debugging
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  // Check the event type and handle it
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Log the session and metadata to verify their structure
    console.log("Stripe Checkout Session:", session);
    console.log("Metadata:", session.metadata); // Log the metadata

    // Retrieve necessary information from the session metadata
    const studentId = session.metadata?.studentId;
    const seasonId = session.metadata?.seasonId;

    // Log metadata values
    console.log("Student ID:", studentId);
    console.log("Season ID:", seasonId);

    if (!studentId || !seasonId) {
      console.error("Student ID or Season ID is missing from session metadata");
      return new NextResponse("Student ID or Season ID is missing from session metadata", { status: 400 });
    }

    // Update the student's status to "Registered"
    try {
      const updatedStudent = await prismadb.student.update({
        where: { UniqueID: Number(studentId) },
        data: { status: "Registered" },
      });

      console.log(`Student ${studentId} status updated to Registered.`);

      // Create the order in your database
      const createdOrder = await prismadb.order.create({
        data: {
          sessionId: session.id, // Store the Stripe session ID
          transactionId: session.payment_intent as string, // Transaction ID from the session
          paymentMethod: session.payment_method_types[0], // e.g., 'card'
          totalAmount: session.amount_total / 100, // Amount in dollars
          paymentDate: new Date(session.created * 1000).toISOString(), // Convert timestamp to ISO format
          isPaid: true, // Mark the order as paid
          seasonId, // Store the season ID from metadata
          Name_First: session.customer_details?.name?.split(" ")[0] || "",
          Name_Last: session.customer_details?.name?.split(" ").slice(1).join(" ") || "",
          phone: session.customer_details?.phone || "",
          address: `${session.customer_details?.address?.line1}, ${session.customer_details?.address?.city}, ${session.customer_details?.address?.state}, ${session.customer_details?.address?.country}, ${session.customer_details?.address?.postal_code}`,
        },
      });

      console.log("Order created:", createdOrder);

      return new NextResponse("Order created and student status updated", { status: 200 });
    } catch (error) {
      console.error("Database Error: ", error);
      return new NextResponse("Database update failed", { status: 500 });
    }
  }

  return new NextResponse(null, { status: 400 });
}
