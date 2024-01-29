import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { sign } from "jsonwebtoken";
import { getPrismaClient } from "@/provider/prismadb";

const prisma = await getPrismaClient();

export async function GET(req) {
  return NextResponse.json("hello");
}

export async function POST(req, res) {
  const data = await req.json();
  const { email, password } = data;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Invaild Credentials" },
      {
        status: 400,
      },
    );
  }

  const user = await prisma.user?.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return NextResponse.json(
      { message: { email: "User not Found!" } },
      {
        status: 400,
      },
    );
  }

  const isVaildPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isVaildPassword) {
    return NextResponse.json(
      { message: { password: "Incorrect Password" } },
      {
        status: 400,
      },
    );
  }

  const resData = { id: user.id, email: user.email, role: user.role };
  const token = sign(resData, process.env.JWT_SECRET);

  const response = new NextResponse(JSON.stringify(resData), {
    status: 200,
  });

  response.cookies.set("jwt", token, {
    httpOnly: true,
    path: "/",
    expires: new Date(Date.now() + 3600000),
    sameSite: "none",
    secure: true,
  });

  return response;
}
