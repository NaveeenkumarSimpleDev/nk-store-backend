import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}
const prisma = new PrismaClient();

export async function POST(req) {
  const data = await req.json();

  if (!data.brand) {
    return NextResponse.json("brand is missing!", {
      status: 400,
    });
  }

  const brand = await prisma.brand.findFirst({
    where: {
      value: {
        equals: data.brand,
        mode: "insensitive",
      },
    },
    include: {
      product: {
        include: {
          variations: true,
          brand: true,
        },
      },
    },
  });

  return NextResponse.json(brand);
}
