import { Router } from "express";
import validate from "express-zod-safe";
import {
  connectLinkedAccountsController,
  getAccountBootstrapController,
  verifyLinkedAccountController,
} from "../Controllers/accounts.controller";
import {
  connectLinkedAccountsBody,
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

export default router;
