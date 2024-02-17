import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET(req) {
  return NextResponse.json("hello Admin 1");
}

export async function POST(req) {
  const data = await req.json();
  if (
    !data.title?.length > 0 ||
    !data.category?.length > 0 ||
    !data.description?.length > 0 ||
    !data.discountPrice?.length > 0 ||
    !data.mrp?.length > 0 ||
    !data.brand
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
  let brand;
  if (data.brand.id) {
    const exsistBrand = await prisma.brand.findFirst({
      where: {
        id: data.brand.id,
      },
    });

    brand = exsistBrand;
  }

  if (data.brand.newBrand) {
    const newBrand = await prisma.brand.create({
      data: {
        value: data.brand.newBrand,
      },
    });

    brand = newBrand;
  }
  const user = await prisma.user.findFirst({
    where: {
      email: data.email,
    },
  });

  if (!user) {
    return NextResponse.json("", { status: 401 });
  }

  const product = await prisma.product.create({
    include: {
      brand: true,
    },
    data: {
      title: data.title,
      category: data.category,
      description: data.description,
      discountPrice: Number(data.discountPrice),
      createdBy: user.id,
      mrp: Number(data.mrp),
      brandId: brand.id,
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
          images: vari.images || [],
          specifications: vari.specifications,
        },
      });
    });
  }

  const res = await prisma.product.findMany({
    where: {
      id: product.id,
    },
    include: {
      variations: true,
    },
  });
  return NextResponse.json("Successfully created");
}

export async function DELETE(req) {
  const data = await req.json();

  if (!data?.id) {
    return NextResponse.json("Please provide id", {
      status: 400,
    });
  }
  const product = await prisma.product.findFirst({
    where: {
      id: data?.id,
    },
  });

  if (!product) {
    return NextResponse.json("Product not found", {
      status: 400,
    });
  }

  await prisma.product.delete({
    where: {
      id: data?.id,
    },
    include: {
      variations: true,
      brand: true,
    },
  });

  return NextResponse.json("Successfully Created.");
}
