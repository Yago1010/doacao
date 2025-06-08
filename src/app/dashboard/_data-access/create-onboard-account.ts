"use server";
import { stripe } from "@/lib/stripe";
export async function getLoginOnboardAccount(accountId: string | undefined) {
  if (!accountId) {
    return null;
  }
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      type: "account_onboarding",
    });

    return accountLink.url;
  } catch (err) {
    console.error("Error creating account link:", err);
    return null;
  }
}
