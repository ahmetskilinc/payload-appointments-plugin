import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import LoginPageClient from "./page.client";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("auth_token");

  if (session) {
    redirect("/dashboard");
  }

  return <LoginPageClient />;
}
