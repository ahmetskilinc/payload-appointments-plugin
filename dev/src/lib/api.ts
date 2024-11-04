import { getAuthToken } from "../app/(frontend)/actions/auth";

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getAuthToken();

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token has expired or is invalid
    // You might want to redirect to login page or refresh the token here
    throw new Error("Unauthorized");
  }

  return response;
}
