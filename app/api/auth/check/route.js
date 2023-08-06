import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const cookie = await req.cookies.get("jwt");
  if (!cookie) {
    return NextResponse.json("", {
      status: 401,
    });
  }

  const verifyCookie = jwt.verify(cookie.value, process.env.JWT_SECRET);

  if (!verifyCookie) {
    return NextResponse.json("", {
      status: 401,
    });
  }

  return NextResponse.json(verifyCookie, {
    status: 200,
  });
}
