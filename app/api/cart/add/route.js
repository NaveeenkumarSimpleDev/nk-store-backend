// import { getPrismaClient } from "@/provider/prismadb";
// import { PrismaClient } from "@prisma/client";
// import { NextResponse } from "next/server";

// // const prisma = await getPrismaClient();
// export async function GET() {
//   return NextResponse.json("su");
// }

// const prisma = new PrismaClient();
// export async function PATCH(req, res) {
//   const data = await req.json();

//   if (!data) {
//     return NextResponse.json("", { status: 401 });
//   }
//   const exisTingCart = await prisma.cart.findFirst({
//     where: {
//       userId: data.userId,
//     },
//     include: {
//       cartItems: true,
//     },
//   });
//   // const
//   // const cart = await prisma.cart.upsert({
//   //   include: {
//   //     cartItems: true,
//   //   },
//   //   create: {
//   //     userId: data?.userId,
//   //   },
//   //   update: {
//   //     cartItems: {
//   //       set: [...exisTingCart.cartItems, { sizes: [], ...data?.product }],
//   //     },
//   //   },
//   //   where: {
//   //     userId: data?.userId,
//   //   },
//   // });

//   const cart = await prisma.cart.update({
//     include: {
//       cartItems: true,
//     },
//     data: {
//       cartItems: {
//         set: [
//           ...exisTingCart.cartItems.map((item) => item),
//           { ...data?.product },
//         ],
//       },
//     },
//     where: {
//       userId: data.userId,
//     },
//   });

//   // const cart = prisma.cart?.create({
//   //   data: {
//   //     userId: id,
//   //     ...req.data,
//   //   },
//   // });
//   return NextResponse.json(cart, {
//     status: 200,
//   });
// }

import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("su");
}

const prisma = new PrismaClient();

export async function POST(req, res) {
  const data = await req.json();

  if (!data) {
    return NextResponse.json("", { status: 401 });
  }

  const existingCart = await prisma.cart.findFirst({
    where: {
      userId: data.userId,
    },
    include: {
      cartItems: true,
    },
  });

  const updatedCartItems = [
    ...existingCart.cartItems.map((item) => item),
    { ...data.product, images: { set: data.product.images } },
  ];

  const updatedCart = await prisma.cart.update({
    include: {
      cartItems: true,
    },
    data: {
      cartItems: {
        set: updatedCartItems,
      },
    },
    where: {
      userId: data.userId,
    },
  });

  return NextResponse.json(updatedCart, {
    status: 200,
  });
}
