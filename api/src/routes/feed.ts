import * as express from "express";
import { Response } from "express";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
const router = express.Router();

router.get("/", routeProtector, async (req: any, res: Response) => {
  try {
    const threadsFromConnections = await req.user.getConnectionThreads();
    res.status(200).send({ connectionThreads: threadsFromConnections });
  } catch (err) {
    res.status(400).send({errors: [{ ...createError("feed error",
    `database error. ${err}`,
    "n/a")} ]});
  }
});

export default router;
