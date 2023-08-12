import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(req) {
  return NextResponse.json("", { status: 200 });
}

const prisma = new PrismaClient();

export async function POST(req) {
  const userId =  req.json();

  if (!userId) {
    return NextResponse.json("", {
      status: 401,
    });
  }
  const favourites = await prisma.favourite.findFirst({
    where: {
      userId,
    },
  });

  if (!favourites) {
    return NextResponse.json("No Favourites", { status: 200 });
  }

  return NextResponse.json(
    { favourites: favourites.favourites },
    { status: 200 }
  );
}
