import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51OhqLLSD9wybvlNM2KWBkI1tT3fZqY0d2pdlBDnTS8M5MvJqRCoixjbYrgCbjwRaIUPnGB07CKdk7qd2XmPLVbEE00lG6Ftx1V"
);

export async function GET(req) {
  return NextResponse.json("//.");
}

export async function POST(req) {
  const prisma = await getPrismaClient();

  const data = await req.json();
  const metadata = data?.metadata;
  if (!data || !metadata || !data?.paymentIntentId)
    return NextResponse.json("No data found", { status: 404 });

  const paymentIntent = await stripe.paymentIntents.retrieve(
    data?.paymentIntentId
  );

  if (!paymentIntent)
    return NextResponse.json("No payment record found!", { status: 404 });

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json("Payment not success.", { status: 404 });
  }
  const keys = Object.keys(metadata);
  const userId = metadata.userId;
  const selectedAddress = metadata.selectedAddress;

  if (!keys) {
    return NextResponse.json("no metadata found");
  }

  Promise.all(
    keys.map(async (k) => {
      if (k == "userId" || k == "selectedAddress") return;
      const values = metadata[k]?.split(",");
      const [variationId, quantity, buyPrice] = values;

      const variation = await prisma.variation.findFirst({
        where: {
          id: variationId,
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
