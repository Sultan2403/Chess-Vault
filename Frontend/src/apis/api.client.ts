import { getToken } from "@clerk/react";
import axios from "axios";

const url = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 30000,
});

/**
 * Ensures Clerk has finished initializing its session before extracting the auth token.
 */
async function waitForClerkReady(): Promise<void> {
  if (typeof window === "undefined") return;

  const clerk = (window as any).Clerk;
  if (!clerk || !clerk.loaded) {
    await new Promise<void>((resolve) => {
      const maxWaitMs = 3000;
      const startTime = Date.now();

      const interval = setInterval(() => {
        const c = (window as any).Clerk;
        if (c?.loaded || Date.now() - startTime >= maxWaitMs) {
          clearInterval(interval);
          resolve();
        }
      }, 25);
    });
  }
}

api.interceptors.request.use(async (config) => {
  await waitForClerkReady();
  const token = await getToken();

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use((res) => res.data);

export default api;
