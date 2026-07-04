import {Router} from "express"
import { saveGameController } from "../Controllers/games.controller";

const router = Router()

router.post("/import", saveGameController)

export default router