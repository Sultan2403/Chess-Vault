import axios from "axios";

export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return String(error.response.data.message);
    }
    if (error.response?.data?.error) {
      return String(error.response.data.error);
    }
    if (error.response?.status === 404) return "Resource not found";
    if (error.response?.status === 401) return "Unauthorized. Please log in.";
    if (error.response?.status === 403) return "Forbidden. You do not have permission.";
    if (error.response?.status === 500) return "Internal server error. Please try again later.";
    if (error.code === "ECONNABORTED" || !error.response) {
      return "Network error. Please check your internet connection.";
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
