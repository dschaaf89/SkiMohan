import { stripe } from "@/lib/stripe";
import { Client } from '@microsoft/microsoft-graph-client';
import { ClientSecretCredential } from '@azure/identity';
import { NextResponse, NextRequest } from 'next/server';

const clientId = process.env.AZURE_CLIENT_ID as string;
const clientSecret = process.env.AZURE_CLIENT_SECRET as string;
const tenantId = process.env.AZURE_TENANT_ID as string;
const senderEmail = process.env.SENDER_EMAIL as string;

export async function POST(request: NextRequest) {
  try {
    const { studentEmail, studentId, seasonId } = await request.json();

    // Create a dynamic Stripe checkout session with metadata
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Transportation Only Registration", // Adjust as needed
            },
            unit_amount: 47500, // Amount in cents (example for $475)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      // Placeholder success and cancel URLs (required by Stripe)
      success_url: `${process.env.FRONT_END_SEASON_URL}/registration-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://placeholder.cancel.url/cancel`,
      // Add metadata to the session
      metadata: {
        studentId: studentId.toString(),
        seasonId: seasonId.toString(),
      },
    });

    // Send the session URL via email
    const credential = new ClientSecretCredential(tenantId, clientId, clientSecret);
    const client = Client.initWithMiddleware({
      authProvider: {
        getAccessToken: async () => {
          const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
          return tokenResponse.token;
        },
      },
    });

    const mail = {
      message: {
        subject: `Mohan Skiing and Boarding: Complete Your Registration - Payment Link`,
        body: {
          contentType: "HTML",
          content: `
            <p>Dear Parent / Student,</p>
            <p>Thank you for registering for the WAITLIST with Mohan Skiing and Boarding! We are READY TO PROCESS YOUR REGISTRATION for this season.Please complete your registration by filling out the payment link here: </p>
            <p><a href="${session.url}">Complete Payment</a></p>
            <p>Upon successful payment, your status will be updated from waitlist to registered.  If you have questions, please email your program coordinator.</p>
            <p>Thank you!</p>
          `,
        },
        from: {
          emailAddress: {
            address: senderEmail,
          },
        },
        toRecipients: [
          {
            emailAddress: {
              address: studentEmail,
            },
          },
        ],
      },
      saveToSentItems: "true",
    };

    await client.api(`/users/${senderEmail}/sendMail`).post(mail);
    return new NextResponse(JSON.stringify({ message: "Payment link sent successfully." }), { status: 200 });
  } catch (error) {
    console.error("Error in sending payment link:", error);
    return new NextResponse(JSON.stringify({ message: "Failed to send payment link." }), { status: 500 });
  }
}
