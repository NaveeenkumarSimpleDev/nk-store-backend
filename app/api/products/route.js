import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// const prisma = await getPrismaClient();
const prisma = new PrismaClient();

export async function GET(req) {
  const { nextUrl } = await req;

  const sort = nextUrl.searchParams.get("sort");
  const range = nextUrl.searchParams.get("range")?.split("-");
  const categories = nextUrl.searchParams.get("cat")?.split(",");
  const brands = nextUrl.searchParams.get("brand")?.split(",");

  if (sort === "Newest") {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });

    let filteredProducts;
    if (categories) {
      filteredProducts = products.filter((product) =>
        categories.includes(product.category)
      );
    } else {
      filteredProducts = [...products];
    }
    if (range) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          Number(p.discountPrice) > Number(range[0]) &&
          Number(p.discountPrice) < Number(range[1])
      );
    }

    if (brands) {
      filteredProducts = filteredProducts.filter((p) =>
        brands.includes(p.brand.value)
      );
    }

    return NextResponse.json(filteredProducts, {
      status: 200,
    });
  }

  if (sort === "priceLowToHigh" || sort === "priceHighToLow") {
    const products = await prisma.product.findMany({
      include: {
        brand: true,
      },
      orderBy: [
        {
          discountPrice: sort === "priceLowToHigh" ? "asc" : "desc",
        },
      ],
    });

    let filteredProducts;
    if (categories) {
      filteredProducts = products.filter((product) =>
        categories.includes(product.category)
      );
    } else {
      filteredProducts = [...products];
    }
    if (range) {
      filteredProducts = filteredProducts.filter(
        (p) =>
          Number(p.discountPrice) > Number(range[0]) &&
          Number(p.discountPrice) < Number(range[1])
      );
    }

    if (brands) {
      filteredProducts = filteredProducts.filter((p) =>
        brands.includes(p.brand.value)
      );
    }

    return NextResponse.json(filteredProducts, {
      status: 200,
    });
  }

  const products = await prisma.product.findMany();

  return NextResponse.json(products, {
    status: 200,
  });
}
