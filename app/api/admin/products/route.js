import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}

const prisma = await getPrismaClient();

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
      createdBy: user.id,
    },
    include: {
      variations: true,
      brand: true,
    },
  });

  const count = await prisma.product.count({
    where: {
      createdBy: user.id,
    },
  });
  return NextResponse.json({ products, count });
}

export async function DELETE(req) {
  const { id } = await req.json();

  await prisma.product.delete({
    where: {
      id,
    },
    include: {
      variations: true,
    },
  });
  return NextResponse.json("Successfully Deleted.");
}
