import Games from "../DB/Models/games.model";
import Folders from "../DB/Models/folders.model";
import LinkedAccounts from "../DB/Models/linked_accounts.model";
import Accounts from "../DB/Models/accounts.model";
import { logger } from "../Config/logger";

export type PurgeResult = {
  gamesDeleted: number;
  foldersDeleted: number;
  linkedAccountsDeleted: number;
  accountDeleted: boolean;
};

export const purgeUserData = async ({
  userId,
}: {
  userId: string;
}): Promise<PurgeResult> => {
  const [gamesResult, foldersResult, linkedAccountsResult, accountResult] =
    await Promise.all([
      Games.deleteMany({ userId }),
      Folders.deleteMany({ userId }),
      LinkedAccounts.deleteMany({ userId }),
      Accounts.deleteOne({ userId }),
    ]);

  const result: PurgeResult = {
    gamesDeleted: gamesResult.deletedCount,
    foldersDeleted: foldersResult.deletedCount,
    linkedAccountsDeleted: linkedAccountsResult.deletedCount,
    accountDeleted: accountResult.deletedCount === 1,
  };

  logger.info({ userId, ...result }, "User data purge complete");

  return result;
};
