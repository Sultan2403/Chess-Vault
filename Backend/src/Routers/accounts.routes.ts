import { Router } from "express";
import validate from "express-zod-safe";
import {
  connectLinkedAccountsController,
  getAccountBootstrapController,
  syncLinkedAccountController,
  verifyLinkedAccountController,
} from "../Controllers/accounts.controller";
import {
  connectLinkedAccountsBody,
  linkedAccountParams,
  linkedAccountInput,
} from "../Schemas/accounts.schema";

const router = Router();

router.get("/bootstrap", getAccountBootstrapController);
router.post(
  "/linked-accounts/verify",
  validate({ body: linkedAccountInput }),
  verifyLinkedAccountController,
);
router.post(
  "/linked-accounts/connect",
  validate({ body: connectLinkedAccountsBody }),
  connectLinkedAccountsController,
);
router.post(
  "/linked-accounts/:id/sync",
  validate({ params: linkedAccountParams }),
  syncLinkedAccountController,
);

export default router;
