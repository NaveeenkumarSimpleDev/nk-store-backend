import { getPrismaClient } from "@/provider/prismadb";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient()

export async function GET(){
  return NextResponse.json('')
}

export async function POST(req, res) {
  const id = await req.json();

  if (!id) {
    return new Response("", {
      status: 401,
    });
  }

  const cart = await prisma.cart?.findUnique({
    where: {
      userId: id,
    },
  });

  return NextResponse.json(cart, {
    status: 200,
  });

}
