"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { stripe } from "@/lib/stripe";

const createPaymentSchema = z.object({
  slug: z.string().min(1, "Slug do creator é obrigatório"),
  name: z.string().min(1, "O nome precisa ter pelo menos 1 letra."),
  message: z.string().min(10, "A mensagem precisa ter pelo menos 5 letras"),
  price: z.number().min(1500, "Selecione um valor maior que R$ 15,00"),
  creatorId: z.string(),
});

type CreatePaymentSchema = z.infer<typeof createPaymentSchema>;
export async function createPayment(data: CreatePaymentSchema) {
  const schema = createPaymentSchema.safeParse(data);
  if (!schema.success) {
    return {
      data: null,
      error: schema.error.issues[0].message,
    };
  }
  if (!data.creatorId) {
    return {
      data: null,
      error: "Creator não encontrado",
    };
  }

  try {
    const creator = await prisma.user.findFirst({
      where: {
        connectedStripeAccountId: data.creatorId,
      },
    });

    if (!creator) {
      return {
        data: null,
        error: "Falha ao criar o pagamento, tente mais tarde.",
      };
    }

    const aplicationFeeAmount = Math.floor(data.price * 0.1); // 10% de taxa de aplicação

    const donation = await prisma.donation.create({
      data: {
        donorName: data.name,
        donorMessage: data.message,
        userId: creator.id,
        status: "PENDING",
        amount: data.price - aplicationFeeAmount,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${process.env.HOSTNAME}/creator/${data.slug}`,
      cancel_url: `${process.env.HOSTNAME}/creator/${data.slug}`,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: `Apoio  ` + creator.name,
            },
            unit_amount: data.price,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: aplicationFeeAmount,
      },
      transfer_data: {
        destination: creator.connectedStripeAccountId as string,
      },
      metadata: {
        dononame: data.name,
        donormessage: data.message,
        donationId: donation.id,
      },
    });

    return {
      sessionId: session.id,
    };
  } catch (err) {
    return {
      error: "Falha ao criar o pagamento, tente mais tarde.",
    };
  }
}
