import z from "zod"
import {GameSchema} from "../Schemas/games.schema"

export type GameInput = z.infer<typeof GameSchema>;