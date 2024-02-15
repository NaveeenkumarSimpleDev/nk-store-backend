import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();
export async function GET(req) {
  const brands = await prisma.brand.findMany();
  prisma;
  return NextResponse.json(brands);
}
