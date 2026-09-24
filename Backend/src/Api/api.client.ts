import axios, { AxiosInstance } from "axios";
import env from "../Config/env";
import { logger } from "../Config/logger";

const chess_com_url = "https://api.chess.com/pub";
const lichess_url = "https://lichess.org/api";

const chess_com_api = axios.create({
  baseURL: chess_com_url,
  timeout: 15000,
  headers: {
    "User-Agent": `Chess-Vault-Backend/1.0 (contact: ${env.DEV_EMAIL})`,
  },
});

const lichess_api = axios.create({
  baseURL: lichess_url,
  timeout: 10000,
  headers: {
    Accept: "application/x-ndjson",
    "User-Agent": `Chess-Vault-Backend/1.0 (contact: ${env.DEV_EMAIL})`,
  },
});

const attachTelemetry = (client: AxiosInstance, provider: "Chess.com" | "Lichess") => {
  client.interceptors.request.use((config) => {
    (config as any).metadata = { startTime: Date.now() };
    return config;
  });

  client.interceptors.response.use(
    (res) => {
      const startTime = (res.config as any)?.metadata?.startTime;
      const durationMs = startTime ? Date.now() - startTime : undefined;
      logger.debug(
        {
          provider,
          url: res.config.url,
          status: res.status,
          durationMs,
        },
        `${provider} API request completed`,
      );
      return res.data;
    },
    (error) => {
      const startTime = (error.config as any)?.metadata?.startTime;
      const durationMs = startTime ? Date.now() - startTime : undefined;
      logger.error(
        {
          provider,
          url: error.config?.url,
          status: error.response?.status,
          code: error.code,
          message: error.message,
          durationMs,
        },
        `${provider} API request failed`,
      );
      return Promise.reject(error);
    },
  );
};

attachTelemetry(chess_com_api, "Chess.com");
attachTelemetry(lichess_api, "Lichess");

export { chess_com_api, lichess_api };

