import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin");
}

const prisma = await getPrismaClient();

export async function POST(req) {
  const { userId } = await req.json();
  if (!userId) {
    return NextResponse.json("Please provide email", {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return NextResponse.json("User not found", {
      status: 400,
    });
  }

  if (user.role == "user") {
    return NextResponse.json("User not authorized", {
      status: 401,
    });
  }

  const orders = await prisma.orders.findMany({
    where: {
      shipperId: userId,
    },
  });

  return NextResponse.json({ orders });
}
