import { NextResponse } from "next/server";

export async function GET(req) {
  const response = new NextResponse("logout success", {
    status: 200,
  });
  const cookieOptions = {
    httpOnly: true,
    path: "/",
    sameSite: "None",
    secure: true,
  };
  response.cookies.set("jwt", "", cookieOptions);
  return response;
}
