import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.json("");
}

export async function POST(req, res) {
  const id = await req.json();

  if (!id) {
    return new Response("", {
      status: 401,
    });
  }

  const cart = await prisma.cart?.findUnique({
    where: {
      userId: id,
    },
  });

  const variationIds = cart?.cartItems?.map((i) => ({
    id: i.variationId,
    quantity: i.quantity,
  }));

  if (!variationIds) return NextResponse.json(cart);

  const variations = await prisma.variation.findMany({
    where: {
      id: {
        in: variationIds.map((i) => i.id),
      },
    },
    include: {
      product: true,
    },
  });

  const modifiedData = variations.map((i) => {
    const find = variationIds.find((v) => v.id === i.id);

    return {
      ...i,
      quantity: find.quantity,
    };
  });
  return NextResponse.json(
    { ...cart, cartItems: modifiedData },
    {
      status: 200,
    },
  );
}
