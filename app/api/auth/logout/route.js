import { NextResponse } from "next/server";

export async function GET(req) {
  const response = new NextResponse("logout success", {
    status: 200,
  });

  response.cookies.delete("jwt", {
    httpOnly: true,
    path: "/",
    sameSite: 'none',
    secure: true
  });

  return response;
}
