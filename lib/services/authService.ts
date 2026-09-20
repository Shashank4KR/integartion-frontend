export const REGISTER_ENDPOINT = "/api/auth/register";
export const LOGIN_ENDPOINT = "/api/auth/login";
export const ME_ENDPOINT = "/api/auth/me";

export type LoginCredentials = {
  username: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<LoginResponse> {
  const body = new URLSearchParams();
  body.set("username", credentials.username);
  body.set("password", credentials.password);
  body.set("grant_type", "password");

  const response = await fetch(LOGIN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    let message = "Login failed. Please try again.";
    try {
      const data = (await response.json()) as { detail?: string | { msg: string }[] };
      const { detail } = data;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        message = detail.map((item) => item.msg).join(", ");
      }
    } catch (err) {
      console.warn("[authService] Login response body not valid JSON:", err);
    }
    throw new Error(message);
  }

  return (await response.json()) as LoginResponse;
}

export async function getCurrentUser(token: string): Promise<{
  id: string;
  username: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  status: boolean;
  last_login?: string | null;
  role_id: string;
  role?: {
    id: string;
    role_name: string;
    description?: string | null;
  } | null;
  created_at: string;
  updated_at?: string | null;
}> {
  const response = await fetch(ME_ENDPOINT, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Failed to fetch user profile.";
    try {
      const data = (await response.json()) as { detail?: string | { msg: string }[] };
      const { detail } = data;
      if (typeof detail === "string") {
        message = detail;
      } else if (Array.isArray(detail) && detail.length > 0) {
        message = detail.map((item) => item.msg).join(", ");
      }
    } catch (err) {
      console.warn("[authService] Profile response body not valid JSON:", err);
    }
    throw new Error(message);
  }

  return (await response.json()) as {
    id: string;
    username: string;
    email: string;
    phone?: string | null;
    avatar_url?: string | null;
    status: boolean;
    last_login?: string | null;
    role_id: string;
    role?: {
      id: string;
      role_name: string;
      description?: string | null;
    } | null;
    created_at: string;
    updated_at?: string | null;
  };
}

