import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(req) {
  const brands = await prisma.brand.findMany();
  prisma 
  return NextResponse.json(brands);
}
