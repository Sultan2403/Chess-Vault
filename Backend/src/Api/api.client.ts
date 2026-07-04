import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

const url = "https://api.chess.com/pub";

const api = axios.create({
  baseURL: url,
});

api.interceptors.request.use((config) => {
  if (!config.headers.has("User-Agent")) {
    config.headers.set("User-Agent", `Chess-Vault-Backend/1.0 ${env.DEV_EMAIL}`);
  }

  return config;
});

// Response interceptor: auto-parse JSON strings and unwrap common `data` envelope
api.interceptors.response.use((res) => res.data);

export default api;
