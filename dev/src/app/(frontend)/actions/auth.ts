"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

// This function would call your auth server
async function loginToAuthServer(email: string, password: string) {
  // Replace this with actual call to your auth server
  const response = await fetch(`${process.env.SERVER_URL}/api/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const data = await response.json();

  if (data.user.roles === "admin") {
    throw new Error("Login failed");
  }

  return data;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { token, exp } = await loginToAuthServer(email, password);

    // Store the token in an HTTP-only cookie
    (await cookies()).set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: exp,
      path: "/",
    });

    redirect("/dashboard");
  } catch (error) {
    // @ts-ignore
    return { error: error.message };
  }
}

export async function logout() {
  (await cookies()).delete("auth_token");
  redirect("/login");
}

export async function getAuthToken() {
  return (await cookies()).get("auth_token")?.value;
}
