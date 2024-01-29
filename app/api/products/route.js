import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET(req) {
  const { nextUrl } = await req;

  const sort = nextUrl.searchParams.get("sort");
  const range = nextUrl.searchParams.get("price_range")?.split("-");
  const categories = nextUrl.searchParams.get("cat")?.split(",");
  const brands = nextUrl.searchParams
    .get("brands")
    ?.split(",")
    ?.map((b) => b.toLowerCase());

  const sortBy =
    sort === "Newest"
      ? {
          createdAt: "asc",
        }
      : sort === "priceLowToHigh"
        ? {
            discountPrice: "asc",
          }
        : sort === "priceHighToLow"
          ? {
              discountPrice: "desc",
            }
          : false;
  let whereCondition = {};

  if (range && range?.length > 1) {
    const minPrice = parseInt(range[0]);
    const maxPrice = parseInt(range[1]);

    whereCondition = {
      discountPrice: {
        gte: minPrice,
        lte: maxPrice,
      },
    };
  }
  if (categories?.length > 0) {
    whereCondition = {
      ...whereCondition,
      category: {
        in: categories,
      },
    };
  }

  let condition;
  if (sortBy) {
    condition = {
      include: {
        variations: true,
        brand: true,
      },
      where: whereCondition,
      orderBy: sortBy,
    };
  } else {
    condition = {
      include: {
        variations: true,
        brand: true,
      },
      where: whereCondition,
    };
  }

  const products = await prisma.product.findMany(condition);

  if (brands?.length > 0) {
    const filterdProducts = products.filter(
      (p) => brands.includes(p.brand.value.toLowerCase()) && p,
    );
    return NextResponse.json(filterdProducts, {
      status: 200,
    });
  }
  return NextResponse.json(products, {
    status: 200,
  });
}
