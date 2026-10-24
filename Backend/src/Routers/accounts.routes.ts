import { Router } from "express";
import validate from "express-zod-safe";
import {
  connectLinkedAccountsController,
  getAccountBootstrapController,
  verifyLinkedAccountController,
  getAccountsStatsPreviewController,
  completeOnboardingController,
  completeTutorialController,
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
  "/linked-accounts/stats-preview",
  validate({ body: connectLinkedAccountsBody }),
  getAccountsStatsPreviewController,
);
router.post(
  "/linked-accounts/connect",
  validate({ body: connectLinkedAccountsBody }),
  connectLinkedAccountsController,
);

router.post("/onboarding/complete", completeOnboardingController);
router.post("/tutorial/complete", completeTutorialController);

export default router;
