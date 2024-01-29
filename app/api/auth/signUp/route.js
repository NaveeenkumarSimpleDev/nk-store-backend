import { getPrismaClient } from "@/provider/prismadb";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import bcrypt from "bcrypt";

const prisma = await getPrismaClient();

export async function GET(req, res) {

  return new Response("success", {
    status: 200,
  });
}

export async function POST(req, res) {
  const data = await req.json();
  const { name, email, password } = data;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "Invaild Credentials" },
      {
        status: 400,
      }
    );
  }

  const isUserExsist = await prisma.user?.findUnique({
    where: {
      email,
    },
  });

  if (isUserExsist) {
    return NextResponse.json(
      { message: "User Already exsist!" },
      {
        status: 400,
      }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user?.create({
    data: {
      name,
      email,
      hashedPassword,
    },
  });

  const cart = await prisma.cart.create({
    data:{
      userId:user.id,
      size: "",
      color: "",
    }
  })

  const resData = { id: user.id,,email:user.email, role: user.role };
  const token = sign(resData, process.env.JWT_SECRET);

  const response = new NextResponse(JSON.stringify(resData), {
    status: 200,
  });

  response.cookies.set("jwt", token, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + 3600000),
  });

  return response;
}
