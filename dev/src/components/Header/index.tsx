import { Button } from "@components/ui/button";
import { logout } from "../../app/(frontend)/actions/auth";
import React from "react";
import { getDashboardData } from "@lib/dashboardData";
import Link from "next/link";

export default async function Header() {
  const dashboardData = await getDashboardData();

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-gray-800">Appointments</span>
            </Link>
          </div>
          <nav className="ml-6 flex items-center">
            {dashboardData.user ? (
              <form action={logout}>
                <Button type="submit">Logout</Button>
              </form>
            ) : null}
          </nav>
        </div>
      </div>
    </header>
  );
}
