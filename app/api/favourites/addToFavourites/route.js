import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("", { status: 200 });
}

const prisma = new PrismaClient();
export async function POST(req, res) {
  const { productId, userId } = await req.json();

  if (!productId || !userId) {
    return NextResponse.json("", {
      status: 400,
    });
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId,
    },
  });

  if (!user) {
    return NextResponse.json("", {
      status: 401,
    });
  }

  const exsistingFavourites = await prisma.favourite.findFirst({
    where: {
      userId: userId,
    },
  });

  if (!exsistingFavourites) {
    const favourites = await prisma.favourite.create({
      data: {
        userId: userId,
        favourites: [productId],
      },
    });

    return NextResponse.json(
      { favourites: favourites?.favourites },
      {
        status: 200,
      }
    );
  }

  const updatedFavourites = [...exsistingFavourites?.favourites, productId];
  const withoutDuplicate = [...new Set(updatedFavourites)];

  const update = await prisma.favourite.updateMany({
    data: {
      favourites: withoutDuplicate,
    },
    where: {
      userId,
    },
  });

  const newFav = await prisma.favourite.findFirst({
    where: {
      userId,
    },
  });

  return NextResponse.json({ favourites: newFav.favourites }, { status: 200 });
}
