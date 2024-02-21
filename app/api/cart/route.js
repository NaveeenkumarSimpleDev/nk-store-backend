import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

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

  if (!cart) return NextResponse.json(null);

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
    }
  );
}
