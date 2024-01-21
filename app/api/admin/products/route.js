import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}
const prisma = new PrismaClient();
export async function POST(req) {
  const data = await req.json();
  if (
    !data.title?.length > 0 ||
    !data.category?.length > 0 ||
    !data.description?.length > 0 ||
    !data.discountPrice?.length > 0 ||
    !data.mar?.length > 0
  ) {
    return NextResponse.json("Please fill all the fields", {
      status: 400,
    });
  }
  const variations = data.variations;
  if (!variations.length > 0) {
    return NextResponse.json("Please Create atleast 1 variation", {
      status: 400,
    });
  }
  const product = await prisma.product.create({
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      discountPrice: Number(data.discountPrice),
      mrp: Number(data.mrp),
    },
  });

  if (variations) {
    variations.map(async (vari) => {
      const variation = await prisma.variation.create({
        data: {
          price: Number(vari.price),
          stock: Number(vari.stock),
          productId: product.id,
          customAttributes: vari.customAttributes,
          images: vari.images,
          specifications: vari.specifications,
        },
      });

      console.log({ variation });
    });
  }

  const res = await prisma.product.findFirst({
    where: {
      id: product.id,
    },
    include: {
      variations: true,
    },
  });

  return NextResponse.json(res);
}
