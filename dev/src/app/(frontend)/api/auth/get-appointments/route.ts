import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, id } = await request.json?.();

  const appointments = await fetch("http://localhost:3000/api/customer/get-appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, email }),
  });

  const data = await appointments.json();

  return NextResponse.json({
    success: true,
    message: "Logged in successfully",
    data: data.data.docs,
  });
}
