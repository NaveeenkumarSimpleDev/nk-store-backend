import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("su");
}

const prisma = await getPrismaClient();

async function updateCartWithRetries(
  userId,
  variationId,
  quantity,
  retries = 5
) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const updatedCart = await prisma.$transaction(async (prisma) => {
        let existingCart = await prisma.cart.findFirst({
          where: { userId },
        });

        if (!existingCart) {
          existingCart = await prisma.cart.create({
            data: { userId },
          });
        }

        let updatedCartItems = existingCart.cartItems || [];
        const itemIndex = updatedCartItems.findIndex(
          (item) => item.variationId === variationId
        );

        if (itemIndex >= 0) {
          updatedCartItems[itemIndex].quantity += quantity;
        } else {
          updatedCartItems.push({ variationId, quantity });
        }

        return await prisma.cart.update({
          where: { userId },
          data: { cartItems: updatedCartItems },
        });
      });

      return updatedCart;
    } catch (error) {
      if (attempt < retries && error.code === "P2034") {
        console.warn(
          `Retry ${attempt}/${retries}: Retrying transaction due to conflict.`
        );
      } else {
        throw error;
      }
    }
  }
  throw new Error("Max retries reached, failed to update cart.");
}

export async function POST(req) {
  const data = await req.json();
  const { userId, variationId, quantity } = data;

  if (!data || !userId || !variationId || !quantity) {
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }

  try {
    const updatedCart = await updateCartWithRetries(
      userId,
      variationId,
      quantity
    );

    const variationIds = updatedCart.cartItems.map((item) => ({
      id: item.variationId,
      quantity: item.quantity,
    }));

    if (!variationIds.length) {
      return NextResponse.json(updatedCart, { status: 200 });
    }

    const variations = await prisma.variation.findMany({
      where: { id: { in: variationIds.map((item) => item.id) } },
      include: { product: true },
    });

    const modifiedData = variations.map((variation) => {
      const found = variationIds.find((item) => item.id === variation.id);
      return { ...variation, quantity: found.quantity };
    });

    return NextResponse.json(
      { ...updatedCart, cartItems: modifiedData },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
