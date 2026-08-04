import axios from "axios";
import env from "../Config/env";

const api = axios.create({
  baseURL: "https://api.paystack.co",
  timeout: 15000,
});

api.interceptors.response.use((res) => res.data);

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${
    env.NODE_ENV === "development" ? env.PAYSTACK_TEST_API_KEY : env.PAYSTACK_API_KEY
  }`;
  return config;
});

export default api;