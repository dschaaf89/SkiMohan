import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Parse the incoming request body
  const { studentId, progCode }: { studentId: string; progCode: string } = await req.json();

  // Fetch the student using the unique ID (assuming studentId is numeric)
  const student = await prismadb.student.findUnique({ where: { UniqueID: Number(studentId) } });

   // Fetch the product using progCode (use findFirst since progCode might not be unique)
   const product = await prismadb.product.findFirst({ where: {a progCode } });

  // Handle cases where the student or product is not found
  if (!student || !product) {
    return new NextResponse("Student or Product not found", { status: 404 });
  }

  // Create a Stripe Checkout session
  const session = await stripe.checkout.sessions.create({
    line_items: [{
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name, // Assuming name is a string
        },
        unit_amount: product.price.toNumber() * 100, // Convert price to cents
      },
      quantity: 1,
    }],
    mode: "payment",
    success_url: `${process.env.FRONT_END_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONT_END_URL}/cancel`,
    metadata: {
      studentId: studentId, // Add the student ID as metadata
    },
  });

  // Return the session URL for the frontend to send via email
  return new NextResponse(JSON.stringify({ url: session.url }), { status: 200 });
}
