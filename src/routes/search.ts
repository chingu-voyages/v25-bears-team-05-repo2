import * as express from "express";
import { Response } from "express";
import { routeProtector } from "../middleware/route-protector";
// import { createError } from "../utils/errors";
const router = express.Router();

router.get("/", routeProtector, (req: any, res: Response) => {

});

export default router;
