import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(
  "sk_test_51OhqLLSD9wybvlNM2KWBkI1tT3fZqY0d2pdlBDnTS8M5MvJqRCoixjbYrgCbjwRaIUPnGB07CKdk7qd2XmPLVbEE00lG6Ftx1V"
);

export async function GET(req) {
  return NextResponse.json("//.");
}

const prisma = await getPrismaClient();

export async function POST(req) {
  try {
    const data = await req.json();

    if (!data) return NextResponse.json("No data found", { status: 404 });

    let metadata = {
      userId: data?.userId,
      selectedAddress: data?.address,
    };

    data?.cartItems?.forEach((i, idx) => {
      const convertToString = i.id + "," + i.quantity + "," + i.price;

      metadata = {
        ...metadata,
        [`variation${idx + 1}`]: convertToString,
      };
    });

    const amount = data?.cartItems?.reduce((prev, item) => {
      return prev + item?.quantity * item?.price;
    }, 0);
    console.log({ amount });
    if (amount <= 0)
      return NextResponse.json("Somthing wrong", { status: 404 });
    const address = await prisma?.address?.findFirst({
      where: {
        id: data?.address,
      },
    });
    if (!address) return NextResponse.json("No Address found", { status: 404 });

    const paymentIntent = await stripe.paymentIntents.create({
      description: "Purchaced in Nk Store.",
      amount,
      metadata,
      currency: "usd",
      shipping: {
        name: address.name,
        address: {
          line1: address.area,
          line2: address.landmark,
          city: address.locality,
          state: address.state,
          postal_code: address.pincode,
          country: "IN",
        },
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      metadata,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      {
        status: 500,
      }
    );
  }
}
