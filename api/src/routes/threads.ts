import * as express from "express";
import { Response } from "express";
import { body } from "express-validator/check";
import { IThreadPostDetails } from "../models/thread/thread.types";
import { routeProtector } from "../middleware/route-protector";
const router = express.Router();

router.post("/", routeProtector, [body("htmlContent").not().isEmpty()], async(req: any, res: Response) => {
  const threadDetails: IThreadPostDetails = {
    html: req.body.htmlContent,
    hashTags: req.body.hashTags,
    threadType: req.body.threadType,
    visibility: req.body.visibility,
    attachments: req.body.attachments
  };
  await req.user.createAndPostThread(threadDetails);
  return res.status(200).send("OK");

router.post("/:id/comments", async(req: any, res: Response) => {

});

router.get("/:id/comments", routeProtector, (req, res) => {

});
export default router;
