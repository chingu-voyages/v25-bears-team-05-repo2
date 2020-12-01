import * as express from "express";
import { Response } from "express";
import { body } from "express-validator/check";
import { IThreadPostDetails } from "../models/thread/thread.types";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { UserModel } from "../models/user/user.model";
const router = express.Router();

router.post("/", routeProtector, [body("htmlContent").not().isEmpty()], async(req: any, res: Response) => {
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

// router.post("/:id/comments", async(req: any, res: Response) => {

// });

// router.get("/:id/comments", routeProtector, (req, res) => {

// });
export default router;
