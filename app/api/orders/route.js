import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();
export async function GET(req) {
  return NextResponse.json("Order.");
}

export async function POST(req) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json("required id", { status: 400 });
  }

  const orders = await prisma.orders.findMany({
    where: {
      userId,
      // isPaid: true,
    },
  });

  if (!orders) {
    return NextResponse.json([], { status: 200 });
  }

  const formatedOrders = await Promise.all(
    orders.map(async (order) => {
      const items = JSON.parse(order.orderItems);
      const formatedVariation = await Promise.all(
        items?.map(async (item) => {
          const { variationId, quantity } = item;

          const variation = await prisma.variation.findFirst({
            where: {
              id: variationId,
            },
            include: {
              product: true,
            },
          });

          return {
            ...variation,
            quantity,
          };
        }),
      );
      return formatedVariation;
    }),
  );

  console.log({ formatedOrders });
  return NextResponse.json(formatedOrders);
}
