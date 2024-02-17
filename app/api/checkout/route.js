import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const prisma = await getPrismaClient();
export async function GET(req) {
  return NextResponse.json("Checkout api.");
}

export async function POST(req) {
  const data = await req.json();

  let formatedData = [];
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

      formatedData.push({
        variationId: variation.id,
        quantity: item.quantity,
        buyPrice: variation.price,
      });

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
    })
  );

  let metadata = {
    userId: data.userId,
    selectedAddress: data.selectedAddress,
  };

  formatedData.forEach((i, idx) => {
    const convertToString = i.id + "," + i.quantity + "," + i.buyPrice;

    metadata = {
      ...metadata,
      [`variation${idx + 1}`]: convertToString,
    };
  });

  if (formatedData.length > 50) {
    return NextResponse.json("", 400);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    metadata,
    success_url: process.env.ALLOWED_ORIGIN + "?checkout_success=true",
    cancel_url: process.env.ALLOWED_ORIGIN,
    shipping_address_collection: { allowed_countries: ["IN", "US", "GB"] },
    currency: "inr",
  });

  return new NextResponse(session.url, { status: 200 });
}
