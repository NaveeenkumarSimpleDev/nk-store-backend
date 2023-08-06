import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();
export async function GET(req, { params }) {
  const productId = params.productId;

  const product = await prisma.product.findFirst({
    where: {
      id: productId,
    },
    include: {
      colors: true,
      sizes: true,
    },
  });

  if (!product) {
    return NextResponse.json("Product not found!", {
      status: 404,
    });
  }

  return NextResponse.json(product, {
    status: 200,
  });
}
