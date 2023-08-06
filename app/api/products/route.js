import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// const prisma = await getPrismaClient();
const prisma = new PrismaClient();
export async function GET(req) {
  const products = await prisma.product.findMany({
    include: {
      colors: true,
      sizes: true,
    },
  });

  return NextResponse.json(products, {
    status: 200,
  });
}
