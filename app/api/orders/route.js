import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// const prisma = await getPrismaClient();
const prisma = new PrismaClient();
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
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!orders) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(orders);
}
