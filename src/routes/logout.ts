import * as express from "express";
import { Request, Response } from "express";
const router = express.Router();

router.post("/", (req: Request, res: Response) => {
  req.logOut();
  res.status(200).send({ message: "Logged out successfully"}); // Placeholder response
});

export default router;
