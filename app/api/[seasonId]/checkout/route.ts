import Stripe from "stripe";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import prismadb from "@/lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function POST(req: Request, { params }: { params: { seasonId: string } }) {
  const { items, userId, couponCode } = await req.json(); // Accept coupon code if provided
  console.log("userID is:",userId);

  if (!items || items.length === 0) {
    return new NextResponse("Product items are required", { status: 400 });
  }

  const productIds = items.map(item => item.id);
  const programCodes = items.map(item => item.programCode); // Extract program codes

  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
  });

  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

  items.forEach((item) => {
    const product = products.find(product => product.id === item.id);

    if (product) {
      line_items.push({
        quantity: item.quantity,
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price.toNumber() * 100,
        },
      });
    }
  });

  const order = await prismadb.order.create({
    data: {
      seasonId: params.seasonId,
      isPaid: false,
      orderItems: {
        create: items.map((item) => ({
          product: {
            connect: {
              id: item.id,
            },
          },
        })),
      },
    },
  });

  // Determine the correct success URL based on program codes
  const isInstructorProduct = programCodes.includes('Instructor');
  const isAssistantProduct = programCodes.includes('Assistant');
  const success_url = isInstructorProduct 
  ? `${process.env.FRONT_END_SEASON_URL}/instructor-signup?orderId=${order.id}&productIds=${productIds.join(',')}&productCodes=${programCodes.join(',')}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`
  : isAssistantProduct
    ? `${process.env.FRONT_END_SEASON_URL}/assistant-signup?orderId=${order.id}&productIds=${productIds.join(',')}&productCodes=${programCodes.join(',')}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`
    : `${process.env.FRONT_END_SEASON_URL}/student-signup?orderId=${order.id}&productIds=${productIds.join(',')}&productCodes=${programCodes.join(',')}&userId=${userId}&session_id={CHECKOUT_SESSION_ID}`;
console.log( "here is the success url",success_url)
  const cancel_url = `${process.env.FRONT_END_SEASON_URL}/cart?canceled=1`;
  console.log('Creating Stripe session with items:', items);
  console.log('Checkout session success URL:', success_url);


  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    line_items,
    mode: "payment",
    billing_address_collection: "required",
    phone_number_collection: {
      enabled: true,
    },
    success_url: success_url,
    cancel_url: cancel_url,
    allow_promotion_codes: true, // Enable promotion codes on the Stripe checkout page
    metadata: {
      orderId: order.id,
    },
  };

  if (couponCode) {
    sessionParams.discounts = [{ coupon: couponCode }];
  }
  const session = await stripe.checkout.sessions.create(sessionParams);
  await Promise.all(
    items.map(async (item) => {
      const product = products.find(product => product.id === item.id);

      if (product && product.quantity >= item.quantity) {
        await prismadb.product.update({
          where: { id: item.id },
          data: { quantity: product.quantity - item.quantity },
        });
      }
    })
  );

  return NextResponse.json({ url: session.url }, {
    headers: corsHeaders,
  });
}
