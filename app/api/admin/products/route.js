import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}
const prisma = new PrismaClient();
export async function POST(req) {
  const { email } = await req.json();
  if (!email) {
    return NextResponse.json("Please provide email", {
      status: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
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

  const products = await prisma.product.findMany({
    where: {
      createdBy: user.email,
    },
    include: {
      variations: true,
      brand: true,
    },
  });

  return NextResponse.json(products);
}
