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
            <p>Thank you for registering for the WAITLIST with Mohan Skiing and Boarding! We are READY TO PROCESS YOUR REGISTRATION for this season. By completing your Registration, you agree to the terms of the below <strong>Refund Policy</strong>, <strong>Teaching Policy</strong>, and <strong>Lateness Policy</strong>. If you do not agree, please let your Program Coordinator know, and we will take you off the waitlist. Please complete your registration by filling out the payment link here:</p>
            <p><a href="${session.url}">Complete Payment</a></p>
            <p>Upon successful payment, your status will be updated from waitlist to registered. If you have questions, please email your program coordinator.</p>
            <p>Thank you!</p>
    
            <p style="color: red; font-weight: bold;">Operation & Refund Policy</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Any delay or failure in the performance of Mohan Skiing & Boarding
                (MSB) hereunder shall be excused if caused by Force Majeure (a
                cause or event that is not reasonably foreseeable or otherwise
                caused by or under the control of MSB, including acts of God).
                Events that are beyond the reasonable anticipation and control to
                prevent, avoid, delay, or mitigate are not attributable to MSB
                failure to perform its obligations under this Agreement.
              </li>
              <li>
                Prior to December 1 of the current registration season,
                participants may request, in writing, a refund for their lessons
                &/or transportation.
              </li>
              <li>
                After November 29 of the current registration season,
                participants' lessons &/or transportation is NOT refundable unless
                the program is not completed by April 30. In this case, prorated
                refund checks will be issued. A $50 or 50% (whichever is greater)
                fee will be subtracted from each refund.
              </li>
              <li>
                Please note that it is typical to postpone program operations
                throughout the season due to weather or road conditions. The
                decision to operate or postpone is at the sole discretion of MSB.
                The operating status is posted daily on the MSB website and phone
                number voicemail. Please check frequently for the latest
                information.
              </li>
              <li>
                If a program is postponed, it is our policy to AUTOMATICALLY add a
                make-up program date to the end of the program schedule until all
                postponements are completed.
              </li>
            </ul>
    
            <p style="color: red; font-weight: bold;">Mohan Skiing & Boarding Teaching Philosophy</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                At Mohan, our goal is to make every student feel safe and confident about themselves and their abilities through their
                experiences of success on the slopes.
              </li>
              <li>
                To enable us to do this, our instructors have been trained to use
                certain areas of the mountain (primarily Holiday and Gallery) to
                teach more advanced techniques before transferring the class to
                challenging terrain. Once the students can demonstrate the
                specific technique, the class will progress to challenging
                terrain. We want the students to be ready to do so safely and with
                control. Please keep in mind that throughout the course of the
                season your students may go back to easier terrain multiple times.
              </li>
              <li>
                This method of teaching has been used at Mohan for several years
                with positive results, enabling us to teach in a safe environment
                for our students and instructors alike. Therefore, it is important
                to remember the area of the mountain where a lesson is taught does
                not always depict the ability level of the class.
              </li>
              <li>
                We believe learning is a lifelong journey that continues long after
                our lessons are over. Teaching our students how to ski safely, with
                care for themselves and others, is imperative to our school.
              </li>
            </ul>
    
            <p style="color: red; font-weight: bold;">Mohan Skiing & Boarding Lateness Policy</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Mohan Skiing & Boarding operates the following lateness policy for all its students.
              </li>
              <li>
                If you are 15 or more minutes late to your lesson, Mohan reserves
                the right to refuse you entry to your class for that day.
              </li>
              <li>
                Missing a class due to tardiness does NOT qualify your student for
                make-up classes.
              </li>
              <li>
                Absences that result in missing your class for two or more
                consecutive weeks will result in forfeiting the remaining classes
                without a refund.
              </li>
              <li>
                If you are late by less than 15 minutes, we will locate your class
                and take the student to their lesson.
              </li>
              <li>
                We ask all our customers to appreciate that the area where we
                teach our classes is vast, consisting of several different ski
                chairs and slopes. Therefore, locating a class can be
                time-consuming and also interrupts the lesson for the other
                students who have arrived on time.
              </li>
            </ul>
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
