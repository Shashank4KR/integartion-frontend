import { loginRequest, getCurrentUser } from "@/lib/services/authService";
import { clearAuth, saveToken, saveUser } from "@/lib/auth";
import type { UserResponse } from "@/types/auth";

export { LOGIN_ENDPOINT, ME_ENDPOINT } from "@/lib/services/authService";

export async function handleLogin(
  username: string,
  password: string,
): Promise<{ token: string; user: UserResponse }> {
  const data = await loginRequest({ username, password });
  // Clear the previous identity before resolving and storing the new one.
  clearAuth();

  const user = await getCurrentUser(data.access_token);

  saveToken(data.access_token);
  saveUser(user);

  return {
    token: data.access_token,
    user,
  };
}

export async function refreshCurrentUser(token: string) {
  const user = await getCurrentUser(token);
  saveUser(user);
  return user;
}
