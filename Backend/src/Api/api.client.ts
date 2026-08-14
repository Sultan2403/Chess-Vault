import axios from "axios";
import env from "../Config/env";

const chess_com_url = "https://api.chess.com/pub";
const lichess_url = "https://lichess.org/api";

const chess_com_api = axios.create({
  baseURL: chess_com_url,
  timeout: 5000,
  headers: {
    "User-Agent": `Chess-Vault-Backend/1.0 (contact: ${env.DEV_EMAIL})`,
  },
});

const lichess_api = axios.create({
  baseURL: lichess_url,
  timeout: 3000,
  headers: {
    Accept: "application/x-ndjson",
    "User-Agent": `Chess-Vault-Backend/1.0 (contact: ${env.DEV_EMAIL})`,
  },
});

chess_com_api.interceptors.response.use((res) => res.data);
lichess_api.interceptors.response.use((res) => res.data);

export { chess_com_api, lichess_api };
