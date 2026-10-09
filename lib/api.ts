import { loginRequest, getCurrentUser } from "@/lib/services/authService";
import { clearAuth, saveToken, saveUser } from "@/lib/auth";
import type { UserResponse } from "@/types/auth";

export { LOGIN_ENDPOINT, ME_ENDPOINT } from "@/lib/services/authService";

export async function handleLogin(
  username: string,
  password: string,
  options: { persist?: boolean } = {},
): Promise<{ token: string; user: UserResponse }> {
  const data = await loginRequest({ username, password });
  const user = await getCurrentUser(data.access_token);

  if (options.persist !== false) {
    // Replace the previous identity only after the new credentials and profile
    // have both been validated successfully.
    clearAuth();
    saveToken(data.access_token ?? "cookie-session");
    saveUser(user);
  }

  return {
    token: "cookie-session",
    user,
  };
}

export async function refreshCurrentUser(token: string) {
  const user = await getCurrentUser(token);
  saveUser(user);
  return user;
}
