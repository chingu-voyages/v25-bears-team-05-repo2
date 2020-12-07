import * as express from "express";
import { Response } from "express";
import { ThreadModel } from "../models/thread/thread.model";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
const router = express.Router();

router.get("/", routeProtector, async (req: any, res: Response) => {
  try {
    const connectionThreads = await req.user.getConnectionThreads();
    const connectionSuggestions = await req.user.getConnectionOfFromConnections();
    const publicThreads = await ThreadModel.getAllPublicThreads(req.user.id.toString());

    // We have to take into account query parameters and limit and offset considerations.

    res.status(200).send({ connectionThreads, connectionSuggestions, publicThreads });
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("feed error",
    `database error. ${err}`,
    "n/a")} ]});
  }
});

export default router;
