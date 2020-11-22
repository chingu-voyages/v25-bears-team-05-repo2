import * as express from "express";
import { Request, Response } from "express";
import { routeProtector } from "../middleware/route-protector";
// import { UserModel } from "../models/user/user.model";
const router = express.Router();

router.get("/", routeProtector, (req: any, res: Response) => {
  console.log("profile", req.user._id);
});
export default router;
