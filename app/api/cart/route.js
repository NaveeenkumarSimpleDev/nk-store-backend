import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();

export async function GET(){
  return NextResponse.json('')
}

export async function POST(req, res) {
  const id = req.json();

  if (!id) {
    return new Response("", {
      status: 401,
    });
  }

  const cart = await prisma.cart?.findFirst({
    where: {
      userId: id,
    },
  });

  return NextResponse.json(cart, {
    status: 200,
  });
}
