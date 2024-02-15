import stripe from "stripe";
import { NextResponse } from "next/server";
import { getPrismaClient } from "@/provider/prismadb";

export async function GET() {
  return NextResponse.json("/stripe");
}
const prisma = await getPrismaClient();
export async function POST(request) {
  const body = await request.text();

  const sig = request.headers.get("stripe-signature");
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
  } catch (err) {
    return NextResponse.json({ message: "Webhook error", error: err });
  }

  // Get the ID and type
  const eventType = event.type;

  // CREATE
  if (eventType === "checkout.session.completed") {
    const { metadata } = event.data.object;

    const order = await prisma.orders.updateMany({
      where: {
        id: metadata.orderId,
        userId: metadata.userId,
      },
      data: {
        isPaid: true,
      },
    });

    return NextResponse.json({ message: "OK", order });
  }

  return new Response("", { status: 200 });
}
