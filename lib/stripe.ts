import Stripe from "stripe";

export function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-02-24.acacia",
  });
}

export const JOB_POSTING_PRICE = 24900;
export const JOB_POSTING_PRICE_DOLLARS = 249;
