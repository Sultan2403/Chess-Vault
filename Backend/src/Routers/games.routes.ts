import {Router} from "express"
import { saveGameController } from "../Controllers/games.controller";

const router = Router()

router.get("/add", saveGameController)