import * as express from "express";
import { Request, Response } from "express";
import { routeProtector } from "../middleware/route-protector";
const router = express.Router();

router.post("/", routeProtector, (req: Request, res: Response) => {
  req.logOut();
  res.status(200).send({ message: "Logged out successfully"}); // Placeholder response
});

export default router;
