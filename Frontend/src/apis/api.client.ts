import { getToken } from "@clerk/react";
import axios from "axios";
import env from "../config/env.ts";

const url = env.VITE_API_URL;

const api = axios.create({
  baseURL: url,
  timeout: 30000,
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) {
        if (value.length > 0) {
          searchParams.append(key, value.join(","));
        }
      } else {
        searchParams.append(key, String(value));
      }
    }
    return searchParams.toString();
  },
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();

  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use((res) => res.data);

export default api;
