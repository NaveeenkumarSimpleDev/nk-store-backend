import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("su");
}
const prisma = new PrismaClient();
export async function POST(req) {
  const data = await req.json();

  if (!data || !data.searchQuery) {
    return NextResponse.json("Search query required", { status: 400 });
  }

  const brands = await prisma.brand.findMany({
    where: {
      value: {
        contains: data.searchQuery,
        mode: "insensitive", // case-insensitive search
      },
    },
  });

  const products = await prisma.product.findMany({
    where: {
      title: {
        contains: data.searchQuery,
        mode: "insensitive", // case-insensitive search
      },
    },
    include: {
      variations: true,
      brand: true,
    },
  });
  if (!brands && !products) {
    return NextResponse.json({ error: "No products found!" });
  }

  return NextResponse.json({ brands, products });
}
