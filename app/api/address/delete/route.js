import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();
export async function GET(req) {
  return NextResponse.json("");
}

export async function POST(req) {
  const data = await req.json();

  if (!data) {
    return NextResponse.json("required id", { status: 400 });
  }

  const userId = data.userId;
  const id = data.id;
  if (!userId || !id) {
    return NextResponse.json("required id", { status: 401 });
  }

  await prisma.address?.delete({
    where: {
      id,
      userId,
    },
  });

  return NextResponse.json("Deleted ");
}
