import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET() {
  return NextResponse.json("cart-update", {
    status: 200,
  });
}

export async function POST(req, res) {
  const reqData = await req.json();

  const { userId, variationId, type } = reqData;

  if (!variationId || !userId) {
    return NextResponse.json("", { status: 400 });
  }

  const cart = await prisma.cart.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!cart) {
    return NextResponse.json("", {
      status: 404,
    });
  }

  // delete item
  if (type === "delete") {
    const updatedCartItems = cart.cartItems.filter(
      (item) => item.variationId !== variationId,
    );

    const updatedCart = await prisma.cart.update({
      where: {
        userId,
      },
      data: {
        cartItems: updatedCartItems,
      },
    });

    return NextResponse.json(updatedCart, {
      status: 200,
    });
  }

  const exsistingProduct = cart.cartItems.findIndex(
    (item) => item.variationId === variationId,
  );

  const updatedCartItems = [...cart.cartItems];

  const minQuantity = Number(updatedCartItems[exsistingProduct]?.quantity) > 1;
  const maxQuantity = Number(updatedCartItems[exsistingProduct]?.quantity) < 10;

  if (type === "inc" && maxQuantity) {
    updatedCartItems[exsistingProduct] = {
      ...updatedCartItems[exsistingProduct],
      quantity: Number(updatedCartItems[exsistingProduct].quantity) + 1,
    };
  } else if (type === "dec" && minQuantity) {
    updatedCartItems[exsistingProduct] = {
      ...updatedCartItems[exsistingProduct],
      quantity: Number(updatedCartItems[exsistingProduct].quantity) - 1,
    };
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
