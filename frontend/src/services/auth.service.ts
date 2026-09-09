import { api } from "./api";
import type { AuthUser } from "@/types/auth";

export const googleLoginUrl = `${import.meta.env.VITE_API_URL}/api/auth/google`;

export const authService = {
  async getMe(): Promise<AuthUser> {
    const { data } = await api.get<AuthUser>("/api/auth/me");
    return data;
  },

  async logout(): Promise<void> {
    await api.post("/api/auth/logout");
  },
};
