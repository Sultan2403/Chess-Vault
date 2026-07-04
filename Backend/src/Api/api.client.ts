import axios from "axios";
import { env } from "../Config/env";

const url = "https://api.chess.com/pub";

const api = axios.create({
  baseURL: url,
});

api.interceptors.request.use((config) => {
  if (!config.headers.has("User-Agent")) {
    config.headers.set(
      "User-Agent",
      `Chess-Vault-Backend/1.0 (contact: ${env.DEV_EMAIL})`,
    );
  }

  return config;
});

api.interceptors.response.use((res) => res.data);

export default api;
