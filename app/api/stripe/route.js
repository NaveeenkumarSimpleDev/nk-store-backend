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

    const keys = Object.keys(metadata);
    const userId = metadata.userId;
    const selectedAddress = metadata.selectedAddress;

    Promise.all(
      keys.forEach(async (k) => {
        if (k == "userId") return;
        const values = metadata[k].split(",");
        const [id, quantity, buyPrice] = values;

        const variation = await prisma.product.findFirst({
          where: {
            id,
          },
          include: {
            product: true,
          },
        });

        if (!variation) return;

        const formatedVariation = {
          ...variation,
          quantity,
          buyPrice,
        };

        await prisma.orders.create({
          data: {
            userId,
            orderItem: formatedVariation,
            shipperId: variation.product.createdBy,
            selectedAddress,
          },
        });
      })
    );

    return NextResponse.json({ message: "OK" });
  }

  return new Response("", { status: 200 });
}
