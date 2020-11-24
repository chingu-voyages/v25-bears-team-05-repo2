import * as express from "express";
import { Request, Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { param, validationResult } from "express-validator/check";
import { UserModel } from "../models/user/user.model";

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

router.get("/:id/connections",
routeProtector,
[ param("id").not().isEmpty().trim().escape()],
async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(500).send({ errors: errors.array() });
  }
  if (req.params.id === "me") {
    // Get requesting user's connections
    res.status(200).send({ data: req.user.connections});
  } else {
    // get and respond with connections of some other user
    try {
      const otherUser = await UserModel.findById(req.params.id);
      if (otherUser) {
        res.status(200).send({ data: otherUser.connections });
      }
    } catch (err) {
      res.sendStatus(400).send(err.Message);
    }
  }
});

router.put("/connections/:id",
routeProtector,
[ param("id").not().isEmpty().trim().escape()],
async(req, res) => {

});

export default router;
