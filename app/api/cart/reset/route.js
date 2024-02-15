import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET() {
  return NextResponse.json("");
}

export async function POST(req) {
  const cartId = await req.json();

  if (!cartId) {
    return NextResponse.json("Invalid data", { status: 400 });
  }

  const cart = await prisma.cart.findUnique({
    where: {
      id: cartId,
    },
  });

  if (!cart) return NextResponse.json("Unauthorized", { status: 401 });

  const resetCart = await prisma.cart.updateMany({
    where: {
      id: cartId,
    },
    data: {
      cartItems: null,
    },
  });

  return NextResponse.json(resetCart);
}
