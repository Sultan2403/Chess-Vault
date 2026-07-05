export type CreateFolderInput = {
  name: string;
  description?: string;
  userId: string;
};

export type UpdateFolderInput = {
  name?: string;
  description?: string;
};

export type PaginatedFolders = {
  folders: Array<Record<string, unknown>>;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
