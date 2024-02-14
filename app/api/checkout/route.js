import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const prisma = new PrismaClient();
export async function GET(req) {
  return NextResponse.json("Checkout api.");
}

export async function POST(req) {
  const data = await req.json();

  const lineItems = await Promise.all(
    data.items.map(async (item) => {
      const variation = await prisma.variation.findFirst({
        where: {
          id: item.variationId,
        },
        include: {
          product: true,
        },
      });

      if (!variation) {
        throw new Error(`Variation with ID ${item.variationId} not found.`);
      }

      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: variation.product.title,
            images: variation.images,
          },
          unit_amount: variation.price * 100,
        },
        quantity: item.quantity,
      };
    }),
  );
  // const order = await prisma.orders.create({
  //   data: {
  //     userId: data.userId,
  //     orderItems: JSON.stringify(data.items),
  //   },
  // });
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata: {
      userId: data.userId,
      // orderId: order.id,
    },
    success_url: process.env.ALLOWED_ORIGIN + "?checkout_success=true",
    cancel_url: process.env.ALLOWED_ORIGIN,
    shipping_address_collection: { allowed_countries: ["IN", "US", "GB"] },
    currency: "inr",
  });

  return new NextResponse(session.url, { status: 200 });
}
