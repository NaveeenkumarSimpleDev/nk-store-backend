import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET(req) {
  return NextResponse.json(".");
}

export async function POST(req) {
  const { userId } = await req.json();

  if (!userId) {
    return NextResponse.json("required id", { status: 400 });
  }

  const addresses = await prisma.address?.findMany({
    where: {
      userId,
    },
  });

  return NextResponse.json(addresses);
}
