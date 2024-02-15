import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json("user api", { status: 200 });
}

const prisma = await getPrismaClient();

export async function POST(req, res) {
  const userId = await req.json();

  if (!userId) {
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
    return NextResponse.json("", { status: 404 });
  }

  return NextResponse.json(user, { status: 200 });
}
