import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// const prisma = await getPrismaClient();
const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.json("");
}

export async function POST(req, res) {
  const reqData = await req.json();

  const { userId, product } = reqData;

  if (!product || !userId) {
    return NextResponse.json("", { status: 401 });
  }
  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
    include: {
      cartItems: true,
    },
  });

  if (!cart) {
    return NextResponse.json("", {
      status: 404,
    });
  }

  const updatedCart = await prisma.cart?.update({
    include: {
      cartItems: true,
    },
    data: {
      cartItems: [...cart.cartItems, { ...product }],
    },
    where: {
      userId: userId,
    },
  });

  return NextResponse.json(updatedCart, {
    status: 200,
  });
}
