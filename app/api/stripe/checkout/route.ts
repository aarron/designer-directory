import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getStripe, JOB_POSTING_PRICE } from "@/lib/stripe";
import { z } from "zod";

const schema = z.object({
  posterFirstName: z.string().min(1),
  posterLastName: z.string().min(1),
  posterEmail: z.string().email(),
  company: z.string().min(1),
  companyUrl: z.string().url().optional().or(z.literal("")),
  title: z.string().min(1),
  role: z.string().min(1),
  location: z.string().min(1),
  remote: z.boolean().default(false),
  typeOfRole: z.string().min(1),
  experienceLevel: z.string().min(1),
  compensation: z.string().optional(),
  companySize: z.string().optional(),
  visaSponsorship: z.boolean().default(false),
  jobUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().optional(),
  couponCode: z.string().optional(),
  matchFrequency: z.enum(["once", "weekly", "biweekly"]).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const job = await db.job.create({
      data: {
        posterFirstName: data.posterFirstName,
        posterLastName: data.posterLastName,
        posterEmail: data.posterEmail,
        company: data.company,
        companyUrl: data.companyUrl || null,
        title: data.title,
        role: data.role,
        location: data.location,
        remote: data.remote,
        typeOfRole: data.typeOfRole,
        experienceLevel: data.experienceLevel,
        compensation: data.compensation,
        companySize: data.companySize,
        visaSponsorship: data.visaSponsorship,
        jobUrl: data.jobUrl || null,
        description: data.description,
        active: false,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        matchFrequency: data.matchFrequency ?? "once",
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    // Apply partial coupon discount if provided
    let finalPrice = JOB_POSTING_PRICE;
    if (data.couponCode) {
      const coupon = await db.coupon.findUnique({
        where: { code: data.couponCode.trim().toUpperCase() },
      });
      if (coupon && coupon.active && !(coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses)) {
        if (coupon.discountType === "percent") {
          finalPrice = Math.round(JOB_POSTING_PRICE * (1 - coupon.discountValue / 100));
        } else {
          finalPrice = Math.max(0, JOB_POSTING_PRICE - coupon.discountValue * 100);
        }
        await db.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: data.posterEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: finalPrice,
            product_data: {
              name: "Design Better Careers — Job Posting",
              description: `${data.title} at ${data.company} · 60 days · Newsletter placement · Candidate shortlist`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { jobId: job.id },
      success_url: `${appUrl}/post-a-job/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/post-a-job`,
    });

    await db.job.update({
      where: { id: job.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid form data." }, { status: 400 });
    }
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}
