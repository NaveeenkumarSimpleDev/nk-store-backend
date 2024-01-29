import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";
const prisma = new PrismaClient();

export async function GET(req) {
  const brands = ["apple"];
  const res = await prisma.product.findMany({
    include: {
      brand: true,
    },
  });

  const brand = res.filter(
    (p) => brands.includes(p.brand.value.toLowerCase()) && p,
  );
  console.log({ brand });
  return NextResponse.json(brand, { status: 200 });
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

  return NextResponse.json(
    { favourites: favourites.favourites },
    { status: 200 },
  );
}
