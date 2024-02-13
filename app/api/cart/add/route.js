import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("su");
}

const prisma = new PrismaClient();

export async function POST(req, res) {
  const data = await req.json();
  const { userId, variationId, quantity } = data;
  if (!data) {
    return NextResponse.json("", { status: 401 });
  }

  const exsistingCart = await prisma.cart?.findFirst({
    where: {
      userId,
    },
  });

  if (!exsistingCart) {
    const cart = await prisma.cart.create({
      data: {
        userId,
        cartItems: [{ variationId, quantity }],
      },
    });

    return NextResponse.json(cart, {
      status: 200,
    });
  }

  let updatedCartItems = exsistingCart.cartItems;

  if (exsistingCart.cartItems) {
    updatedCartItems.push({ variationId, quantity: quantity || 1 });
  } else {
    updatedCartItems = [{ variationId, quantity: quantity || 1 }];
  }

  const updatedCart = await prisma.cart.update({
    where: {
      userId,
    },
    data: {
      cartItems: updatedCartItems,
    },
  });

  const variationIds = updatedCart?.cartItems?.map((i) => ({
    id: i.variationId,
    quantity: i.quantity,
  }));

  if (!variationIds) return NextResponse.json(updatedCart);

  // const variations = await Promise.all(
  //   variationIds.map(async (item) => {
  //     const variation = await prisma.variation.findFirst({
  //       where: {
  //         id: item.id,
  //       },
  //       include: {
  //         product: true,
  //       },
  //     });

  //     return {
  //       ...variation,
  //       quantity: item.quantity,
  //     };
  //   }),
  // );

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
    { ...updatedCart, cartItems: modifiedData },
    {
      status: 200,
    },
  );
}
