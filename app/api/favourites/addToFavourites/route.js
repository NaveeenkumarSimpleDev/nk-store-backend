import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("", { status: 200 });
}

const prisma = await getPrismaClient();

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
      },
    );
  } else {
    const updatedFavourites = [...exsistingFavourites?.favourites, productId];
    const withoutDuplicateValues = [...new Set(updatedFavourites)];
    await prisma.favourite.updateMany({
      data: {
        favourites: withoutDuplicateValues,
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

    console.log(newFav);

    return NextResponse.json(
      { favourites: newFav?.favourites },
      { status: 200 },
    );
  }
}
