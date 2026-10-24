import api from "./api.client";
import type { Import, StartImportInput } from "@chess-vault/shared";

const importsApi = {
  /**
   * Triggers an import run for a specific linked account.
   */
  startImport: async (data: StartImportInput): Promise<{ success: boolean; message: string; import: Import }> => {
    return api.post("/imports/start", data);
  },

  /**
   * Fetches the user's import history (most recent first).
   */
  getImportHistory: async (): Promise<{ success: boolean; message: string; history: Import[] }> => {
    return api.get("/imports/history");
  },
};

export default importsApi;
