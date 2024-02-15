import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}
const prisma = await getPrismaClient();

export async function POST(req) {
  const data = await req.json();

  if (!data.category) {
    return NextResponse.json("brand is missing!", {
      status: 400,
    });
  }

  const products = await prisma.product.findMany({
    where: {
      category: {
        equals: data.category,
        mode: "insensitive",
      },
    },
    include: {
      variations: true,
      brand: true,
    },
  });
  return NextResponse.json(products);
}
