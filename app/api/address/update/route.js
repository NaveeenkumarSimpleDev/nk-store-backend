import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";

const prisma = await getPrismaClient();
export async function GET(req) {
  return NextResponse.json(".");
}

export async function POST(req) {
  const data = await req.json();

  if (!data) {
    return NextResponse.json("required id", { status: 400 });
  }
  const id = data.id;
  const area = data.area;
  const landmark = data.landmark;
  const locality = data.locality;
  const mobile = data.mobile;
  const name = data.name;
  const pincode = data.pincode;
  const city = data.city;
  const state = data.state;
  const userId = data.userId;
  if (!userId || !userId) {
    return NextResponse.json("required id", { status: 401 });
  }

  const addressFromDb = await prisma.address?.findFirst({
    where: {
      userId,
    },
  });
  if (!addressFromDb) {
    return NextResponse.json("Not found", { status: 400 });
  }
  const update = await prisma.address?.updateMany({
    where: {
      userId,
      id,
    },
    data: {
      area,
      mobile,
      name,
      city,
      landmark: landmark || "",
      state,
      pincode,
      locality,
    },
  });
  const updatedAdd = await prisma.address.findFirst({
    where: {
      id,
    },
  });

  return NextResponse.json(updatedAdd);
}
