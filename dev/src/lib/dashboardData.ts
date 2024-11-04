import { fetchWithAuth } from "@lib/api";

const SERVER_URL = process.env.SERVER_URL;

export async function getDashboardData() {
  const response = await fetchWithAuth(`${SERVER_URL}/api/users/me`);
  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data");
  }
  return response.json();
}
