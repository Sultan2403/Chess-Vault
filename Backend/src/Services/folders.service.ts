import Folders from "../DB/Models/folders.model";
import {
  CreateFolderInput,
  PaginatedFolders,
  UpdateFolderInput,
} from "../Types/folder.types";

export const getUserFolders = async (
  userId: string,
  page = 1,
  limit = 20,
): Promise<PaginatedFolders> => {
  const pageNumber = Math.max(1, page);
  const limitNumber = Math.max(1, Math.min(100, limit));
  const skip = (pageNumber - 1) * limitNumber;

  const [folders, total] = await Promise.all([
    Folders.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Folders.countDocuments({ userId }),
  ]);

  return {
    folders: folders.map((f) => {
      const { _id, __v, ...rest } = f;
      return {
        id: _id.toString(),
        ...rest,
      };
    }),
    total,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(total / limitNumber),
  };
};

export const getFolderById = async (id: string, userId: string) => {
  const folder = await Folders.findOne({ _id: id, userId }).lean();
  if (!folder) return null;
  const { _id, __v, ...rest } = folder;
  return { id: _id.toString(), ...rest };
};

export const createFolder = async (payload: CreateFolderInput) => {
  const folder = new Folders(payload);
  return await folder.save();
};

export const updateFolder = async (
  id: string,
  userId: string,
  payload: UpdateFolderInput,
) => {
  const folder = await Folders.findOneAndUpdate(
    { _id: id, userId },
    { $set: payload },
    { returnDocument: "after", runValidators: true },
  ).lean();
  if (!folder) return null;
  const { _id, __v, ...rest } = folder;
  return { id: _id.toString(), ...rest };
};

export const deleteFolder = async (id: string, userId: string) => {
  const result = await Folders.deleteOne({ _id: id, userId });
  return result.deletedCount === 1;
};
