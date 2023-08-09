import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// const prisma = await getPrismaClient();
const prisma = new PrismaClient();

export async function GET() {
  return NextResponse.json("cart-update", {
    status: 200,
  });
}

export async function POST(req, res) {
  const reqData = await req.json();

  const { userId, productId, type } = reqData;

  if (!productId || !userId || !type) {
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
      (item) => item.id !== productId
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
    (item) => item.id === productId
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

  return NextResponse.json(updatedCart, {
    status: 200,
  });
}
