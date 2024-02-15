import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("hello Admin 1");
}

const prisma = await getPrismaClient();

export async function POST(req) {
  const data = await req.json();

  console.log({ data });
  if (!data || !data.id) {
    return NextResponse.json("Please provide data", {
      status: 400,
    });
  }

  const variations = data.variations;
  if (!variations.length > 0) {
    return NextResponse.json("Please Create atleast 1 variation", {
      status: 400,
    });
  }

  const exsists = await prisma.product.findFirst({
    where: {
      id: data.id,
    },
  });

  if (!exsists) {
    return NextResponse.json("Product not found", {
      status: 400,
    });
  }

  if (
    data.title?.length < 1 ||
    data.category?.length < 1 ||
    data.description?.length < 1 ||
    data.discountPrice?.length < 1 ||
    data.mrp?.length < 1 ||
    !data.brand
  ) {
    return NextResponse.json("Please fill all the fields", {
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
  await prisma.product.updateMany({
    where: {
      id: data.id,
    },
    data: {
      title: data.title,
      category: data.category,
      brandId: brand.id,
      description: data.description,
      discountPrice: Number(data.discountPrice),
      mrp: Number(data.mrp),
    },
  });

  const oldVariations = await prisma.variation.findMany({
    where: {
      productId: data.id,
    },
  });

  const deletedVariations = oldVariations?.filter((vari) => {
    return !variations?.some((newVari) => newVari.id === vari.id);
  });

  Promise.all(
    deletedVariations?.map(async (vari) => {
      await prisma.variation.delete({
        where: {
          id: vari.id,
        },
      });
    }),
  );

  Promise.all(
    variations.map(async (vari) => {
      if (!vari.id) {
        await prisma.variation.create({
          data: {
            price: Number(vari.price),
            stock: Number(vari.stock),
            productId: data.id,
            customAttributes: vari.customAttributes,
            images: vari.images,
            specifications: vari.specifications,
          },
        });
      } else {
        const variation = await prisma.variation.update({
          where: {
            id: vari.id,
          },
          data: {
            price: Number(vari.price),
            stock: Number(vari.stock),
            productId: data.id,
            customAttributes: vari.customAttributes,
            images: vari.images,
            specifications: vari.specifications,
          },
        });
      }
    }),
  );

  const res = await prisma.product.findMany({
    where: {
      id: data.id,
    },
    include: {
      variations: true,
      brand: true,
    },
  });
  return NextResponse.json(res);
}
