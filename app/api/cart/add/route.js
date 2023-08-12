import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("su");
}

const prisma = new PrismaClient();

export async function POST(req, res) {
  const data = await req.json();

  if (!data) {
    return NextResponse.json("", { status: 401 });
  }

  const exsistingCart = await prisma.cart?.findFirst({
    where: {
      userId: data.userId,
    },
  });

  if (!exsistingCart) {
    const cart = await prisma.cart.create({
      data: {
        cartItems: [data?.product],
        userId: data?.userId,
        size: "",
        color: "",
      },
    });

    return NextResponse.json(cart, {
      status: 200,
    });
  }

  let updatedCartItems;

  if (exsistingCart.cartItems) {
    updatedCartItems = [
      ...exsistingCart.cartItems,
      {
        ...data?.product,
        quantity: data?.product?.quantity ? data?.product?.quantity : 1,
      },
    ];
  } else {
    updatedCartItems = [{ ...data?.product, quantity: 1 }];
  }

  const updatedCart = await prisma.cart.update({
    where: {
      userId: data.userId,
    },
    data: {
      cartItems: updatedCartItems,
    },
  });

  return NextResponse.json(updatedCart, {
    status: 200,
  });
}
