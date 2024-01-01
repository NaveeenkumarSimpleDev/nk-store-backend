import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
// // const prisma = await getPrismaClient();

export async function GET(req) {
  const { nextUrl } = await req;

  const sort = nextUrl.searchParams.get("sort");
  const range = nextUrl.searchParams.get("price_range")?.split("-");
  const categories = nextUrl.searchParams.get("cat")?.split(",");
  const brands = nextUrl.searchParams.get("brands")?.split(",");

  const sortBy =
    sort === "Newest"
      ? {
          createdAt: "asc",
        }
      : sort === "priceLowToHigh"
        ? {
            discountPrice: "desc",
          }
        : sort === "priceHighToLow"
          ? {
              discountPrice: "asc",
            }
          : false;
  let whereCondition = {};

  if (range && range?.length > 1) {
    const minPrice = parseInt(range[0] || 0);
    const maxPrice = parseInt(range[1] || 0);
    if (minPrice && maxPrice != 0) {
      whereCondition = {
        variations: {
          some: {
            price: {
              gte: minPrice,
              lte: maxPrice,
            },
          },
        },
      };
    }
  }
  if (categories.length > 0) {
    whereCondition = {
      ...whereCondition,
      category: {
        in: categories,
      },
    };
  }
  console.log(whereCondition);
  const products = await prisma.product.findMany({
    include: {
      variations: true,
    },
    where: whereCondition,
    orderBy: false,
  });

  return NextResponse.json(products, {
    status: 200,
  });

  // if(brands.length > 0){
  //   whereCondition = {
  //     ...whereCondition,
  //     brand: {
  //       name: {
  //         in: brands
  //       }
  //     }
  //   }
  // }
}

// // export async function GET(req) {
// //   const { nextUrl } = await req;

// //   const pr = await prisma.product.findMany({
// //     include: {
// //       brand: true,
// //     },
// //   });
// //   return NextResponse.json(pr, {
// //     status: 200,
// //   });
// //   const sort = nextUrl.searchParams.get("sort");
// //   const range = nextUrl.searchParams.get("price_range")?.split("-");
// //   const categories = nextUrl.searchParams.get("cat")?.split(",");
// //   const brands = nextUrl.searchParams.get("brands")?.split(",");

// //   let whereCondition;

// //   if (range[0] && range[1]) {
// //     const minPrice = parseInt(range[0]);
// //     const maxPrice = parseInt(range[1]);
// //     if (minPrice && maxPrice != 0) {
// //       whereCondition = {
// //         variations: {
// //           some: {
// //             price: {
// //               gte: minPrice,
// //               lte: maxPrice,
// //             },
// //           },
// //         },
// //       };
// //     }
// //   }

// //   if (categories.length > 0) {
// //     whereCondition.category = {
// //       in: categories,
// //     };
// //   }

// //   if (brands.length > 0) {
// //     whereCondition.brand = {
// //       in: brands,
// //     };
// //   }

// //   const filteredProducts = await prisma.product.findMany({
// //     where: whereCondition,
// //     include: {
// //       variations: true,
// //       brand: true,
// //     },
// //     orderBy: {
// //       category: "asc",
// //       brand: "asc",
// //     },
// //   });

// //   return NextResponse.json(filteredProducts, {
// //     status: 200,
// //   });

// //   if (sort === "Newest") {
// //     const products = await prisma.product.findMany({
// //       include: {
// //         brand: true,
// //       },
// //       orderBy: [
// //         {
// //           createdAt: "desc",
// //         },
// //       ],
// //     });

// //     let filteredProducts;
// //     if (categories) {
// //       filteredProducts = products.filter((product) =>
// //         categories.includes(product.category),
// //       );
// //     } else {
// //       filteredProducts = [...products];
// //     }
// //     if (range) {
// //       filteredProducts = filteredProducts.filter(
// //         (p) =>
// //           Number(p.discountPrice) > Number(range[0]) &&
// //           Number(p.discountPrice) < Number(range[1]),
// //       );
// //     }

// //     if (brands) {
// //       filteredProducts = filteredProducts.filter((p) =>
// //         brands.includes(p.brand.value),
// //       );
// //     }

// //     return NextResponse.json(filteredProducts, {
// //       status: 200,
// //     });
// //   }

// //   if (sort === "priceLowToHigh" || sort === "priceHighToLow") {
// //     const products = await prisma.product.findMany({
// //       include: {
// //         brand: true,
// //       },
// //       orderBy: [
// //         {
// //           discountPrice: sort === "priceLowToHigh" ? "asc" : "desc",
// //         },
// //       ],
// //     });

// //     let filteredProducts;
// //     if (categories) {
// //       filteredProducts = products.filter((product) =>
// //         categories.includes(product.category),
// //       );
// //     } else {
// //       filteredProducts = [...products];
// //     }
// //     if (range) {
// //       filteredProducts = filteredProducts.filter(
// //         (p) =>
// //           Number(p.discountPrice) > Number(range[0]) &&
// //           Number(p.discountPrice) < Number(range[1]),
// //       );
// //     }

// //     if (brands) {
// //       filteredProducts = filteredProducts.filter((p) =>
// //         brands.includes(p.brand.value),
// //       );
// //     }

// //     return NextResponse.json(filteredProducts, {
// //       status: 200,
// //     });
// //   }

// //   const products = await prisma.product.findMany();

// //   return NextResponse.json(products, {
// //     status: 200,
// //   });
// // }
