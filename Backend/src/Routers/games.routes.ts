import {Router} from "express"
import { saveGameController } from "../Controllers/games.controller";

const router = Router()

router.post("/", saveGameController)

export default router