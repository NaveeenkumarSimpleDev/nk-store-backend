import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin");
}

const prisma = await getPrismaClient();

export async function POST(req) {
  const { status, orderId } = await req.json();

  if (!status || !orderId)
    return NextResponse.json("required data", { status: 400 });

  await prisma.orders.update({
    where: {
      id: orderId,
    },
    data: {
      status,
    },
  });

  return NextResponse.json("Order updated.");
}
