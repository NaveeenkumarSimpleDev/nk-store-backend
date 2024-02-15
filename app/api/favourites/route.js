import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET(req) {
  return NextResponse.json("", { status: 200 });
}

export async function POST(req) {
  const userId = await req.json();

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

  return NextResponse.json(favourites.favourites, { status: 200 });
}
