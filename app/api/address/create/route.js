import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();
export async function GET(req) {
  return NextResponse.json(".");
}

export async function POST(req) {
  const data = await req.json();

  if (!data) {
    return NextResponse.json("required id", { status: 400 });
  }

  const area = data.area;
  const landmark = data.landmark;
  const locality = data.locality;
  const mobile = data.mobile;
  const name = data.name;
  const pincode = data.pincode;
  const city = data.city;
  const state = data.state;
  const userId = data.userId;
  if (!userId) {
    return NextResponse.json("required id", { status: 401 });
  }

  const newAddress = await prisma.address?.create({
    data: {
      area,
      userId,
      mobile,
      name,
      city,
      landmark: landmark || "",
      state,
      pincode,
      locality,
    },
  });

  console.log({ newAddress });

  const addresses = await prisma.address?.findMany({
    where: {
      userId,
    },
  });

  return NextResponse.json(addresses);
}
