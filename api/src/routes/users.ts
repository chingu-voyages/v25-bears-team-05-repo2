import * as express from "express";
import { Request, Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { param, validationResult } from "express-validator/check";

const router = express.Router();

router.get("/:id", routeProtector, [ param("id").not().isEmpty().trim().escape()], async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  if (req.params.id === "me") {
    const homeProfileData = await getProfileById(req.user._id);
    return res.status(200).send({ data: homeProfileData });
  } else {
    const otherUserData = await getProfileById(req.params.id);
    return res.status(200).send({ data: otherUserData });
  }
});

router.get("/:id/connections",  routeProtector, [ param("id").not().isEmpty().trim().escape()],  async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).send({ errors: errors.array() });
  }
});

export default router;
