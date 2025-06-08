import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import {prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {

    const sig = req.headers.get("stripe-signature")!
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

    let event: Stripe.Event;
    
    try {
        const payload = await req.text();
        event = stripe.webhooks.constructEvent(
            payload,
            sig,
            endpointSecret   )
    } catch (err) {
        console.error("FALHA AO AUTENTICAR ASSINATURA: ",err);
        return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
    }

    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            const paymentIntentId =  session.payment_intent as string;
           
            //pegar as informações do pagamento 
         const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
         const donorName = paymentIntent.metadata.donorName;
         const donoMessage = paymentIntent.metadata.donorMessage;
         const donateId = paymentIntent.metadata.donateId;

         try{
         const updateDonation = await prisma.donation.update({
            where: {
                id: donateId,
            },
            data: {
                status: "PAID",
                donorName: donorName ?? "Anônimo",
                donorMessage: donoMessage ?? " Sem mensagem",
            },
         })

            console.log("## DOAÇÃO ATUALIZADA: ", updateDonation);
            
        } catch(err){
            console.log("## ERRO ", err)
        }

        break;

        default:
            console.warn(`Evento não tratado ${event.type}`);

        return NextResponse.json({ ok: true});

}



}