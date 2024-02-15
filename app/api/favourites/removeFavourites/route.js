import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("", { status: 200 });
}
const prisma = await getPrismaClient();
export async function POST(req) {
  const { userId, productId } = await req.json();

  if (!userId || !productId) {
    return NextResponse.json("", {
      status: 400,
    });
  }

  const favourites = await prisma.favourite.findFirst({
    where: {
      userId,
    },
  });

  if (!favourites) {
    return NextResponse.json("", { status: 200 });
  }

  const updatedFavourites = favourites?.favourites?.filter(
    (item) => item !== productId
  );

  await prisma.favourite.updateMany({
    data: {
      favourites: updatedFavourites,
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

  return NextResponse.json(
    { favourites: newFav.favourites },
    {
      status: 200,
    }
  );
}
