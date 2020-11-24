import * as express from "express";
import { Request, Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { UserModel } from "../models/user/user.model";
import { createError } from "../utils/errors";

const router = express.Router();

router.get("/:id", routeProtector, [ param("id").not().isEmpty().trim().escape()], async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  if (req.params.id === "me") {
    const homeProfileData = await getProfileById(req.user._id);
    return res.status(200).send(homeProfileData);
  } else {
    const otherUserData = await getProfileById(req.params.id);
    return res.status(200).send(otherUserData);
  }
});

router.get("/:id/connections",
routeProtector,
[ param("id").not().isEmpty().trim().escape()],
async (req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  if (req.params.id === "me") {
    // Get requesting user's connections
    res.status(200).send(req.user.connections);
  } else {
    // get and respond with connections of some other user
    try {
      const otherUser = await UserModel.findById(req.params.id);
      if (otherUser) {
        res.status(200).send(otherUser.connections);
      }
    } catch (err) {
      res.status(400).send({errors: [{ ...createError("get connections", `database error. ${err.Message}`, "id")} ]});
    }
  }
});

router.put("/connections/:id",
routeProtector,
[ param("id").not().isEmpty().trim().escape(),
body("isTeamMate").not().isEmpty().isBoolean().trim().escape()],
async(req: any, res: Response) => {
  if (req.params.id === "me") {
    return res.status(400).send({ errors: [{
      "location": "param",
      "msg": "Can't use 'me' in this type of request",
      "param": "id"
    }]});
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    await req.user.addConnectionToUser(req.params.id, req.body.isTeamMate);
    return res.status(200).send([req.user.connections, req.user.connectionOf]);
  } catch (err) {
    return res.status(400).send({errors: [{
      "location": "response",
      "msg": `Unable to complete. ${err.Message}`,
      "param": "null"
    }]});
  }
});

router.delete("/connections/:id", routeProtector, [ param("id").not().isEmpty().trim().escape()], async (req: any, res: Response) => {
  if (req.params.id === "me") {
    return res.status(400).send({ errors: [{
      "location": "param",
      "msg": "Can't use 'me' in this type of request",
      "param": "id"
    }]});
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    await req.user.deleteConnectionFromUser(req.params.id);
    return res.status(200).send([req.user.connections, req.user.connectionOf]);
  } catch (err) {
    return res.status(400).send({errors: [{
      "location": "response",
      "msg": `Unable to complete. ${err.Message}`,
      "param": "null"
    }]});
  }
});

export default router;
