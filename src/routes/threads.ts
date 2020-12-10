import * as express from "express";
import { Response } from "express";
import { body, param, validationResult } from "express-validator/check";
import { IThreadPostDetails } from "../models/thread/thread.types";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { UserModel } from "../models/user/user.model";
import { sanitizeBody } from "express-validator/filter";
const router = express.Router();

router.post("/", routeProtector, [body("htmlContent").not().isEmpty().trim(), // Unsure whether or not to escape here?
body("threadType").isNumeric().not().isEmpty(),
body("visibility").not().isEmpty().isNumeric(), body("hashTags").custom((value) => {
  if (!value) {
    return true;
  }
  return Array.isArray(value);
}), body("attachments").custom((value) => {
  if (!value) {
    return true;
  }
  return Array.isArray(value);
}), sanitizeBody("hashTags"), sanitizeBody("htmlContent"), sanitizeBody("attachments")], async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  const threadDetails: IThreadPostDetails = {
    html: req.body.htmlContent,
    hashTags: req.body.hashTags,
    threadType: req.body.threadType,
    visibility: req.body.visibility,
    attachments: req.body.attachments
  };
  try {
    const user = await UserModel.findById(req.user.id);
    const newData = await user.createAndPostThread(threadDetails);
    return res.status(200).send(newData.threadData);
  } catch (err) {
    res.status(400).send({errors: [{ ...createError("create thread POST request",
    `database error. ${err.Message}`,
    "req.body")} ]});
  }
});

router.patch("/:id", routeProtector, [param("id").not().isEmpty().trim().escape() ], async(req: any, res:Response)=> {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // User should be able to update threadType, visibility, and the content
})

router.post("/:id/comments", async(req: any, res: Response) => {
  res.send(200);
});

router.get("/:id/comments", routeProtector, (req, res) => {
  res.send(200);
});
export default router;
