import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { resend, FROM } from "@/lib/resend";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const jobId = session.metadata?.jobId;

    if (!jobId) return NextResponse.json({ received: true });

    const job = await db.job.update({
      where: { id: jobId },
      data: {
        active: true,
        stripePaymentStatus: "paid",
      },
    });

    // Notify admin
    await resend.emails.send({
      from: FROM,
      to: process.env.ADMIN_EMAIL!,
      subject: `New job posted: ${job.title} at ${job.company}`,
      html: `
        <h2>New job posting received</h2>
        <p><strong>Role:</strong> ${job.title}</p>
        <p><strong>Company:</strong> ${job.company}</p>
        <p><strong>Posted by:</strong> ${job.posterFirstName} ${job.posterLastName} (${job.posterEmail})</p>
        <p><strong>Location:</strong> ${job.location}${job.remote ? " · Remote OK" : ""}</p>
        <p><strong>Type:</strong> ${job.typeOfRole}</p>
        ${job.jobUrl ? `<p><strong>Job URL:</strong> <a href="${job.jobUrl}">${job.jobUrl}</a></p>` : ""}
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}">View listing →</a></p>
        <hr />
        <p><em>Send a curated candidate shortlist to ${job.posterEmail} within 48 hours.</em></p>
      `,
    });

    // Confirm to poster
    await resend.emails.send({
      from: FROM,
      to: job.posterEmail,
      subject: `Your job listing is live — ${job.title} at ${job.company}`,
      html: `
        <h2>Your job is live on Design Better Careers!</h2>
        <p>Hi ${job.posterFirstName},</p>
        <p>Your listing for <strong>${job.title}</strong> at <strong>${job.company}</strong> is now live.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}">View your listing →</a></p>
        <h3>What happens next</h3>
        <ul>
          <li>Your listing is visible to all directory visitors immediately.</li>
          <li>We'll match your role against our designer profiles and send you a curated shortlist within 48 hours.</li>
          <li>Your role will be featured in The Roundup this Friday.</li>
          <li>You'll receive a 30-day analytics report with view counts.</li>
        </ul>
        <p>Questions? Reply to this email.</p>
        <p>— Design Better Careers</p>
      `,
    });
  }

  return NextResponse.json({ received: true });
}
