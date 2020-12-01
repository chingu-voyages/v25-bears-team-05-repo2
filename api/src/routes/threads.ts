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

// POIJ to be implemented in subsequent version

// router.delete("/:id", routeProtector,
// [ param("id").not().isEmpty().trim().escape()],
// async (req: any, res: Response) => {
//   // A user can only delete a thread node on their own profile
//   console.log(req.params.id);
//   try {
//     const user = await UserModel.findById(req.user.id);
//     if (user) {
//       // What to do about threadShares that reference a deleted `source` thread?
//       if (user.threads.started[req.params.id]) {
//         delete user.threads.started[req.params.id];
//         user.markModified("threads");
//         await user.save();
//         return res.status(200).send(user.threads); // Not sure if this is what we want to return?
//       } else {
//         // if the thread with the id isn't found
//         return res.status(400).send({errors: [{ ...createError("delete thread request",
//         `Thread not found for user ${user.id}`,
//         `thread ${req.params.id}`)} ]});
//       }

//     } else {
//       return res.status(400).send({errors: [{ ...createError("delete thread request",
//       `User not found`,
//       "n/a")} ]});
//     }
//   } catch (err) {
//     console.log(err);
//     return res.status(400).send({errors: [{ ...createError("delete thread request",
//       `Bad request. ${err}`,
//       "n/a")} ]});
//   }
// });

router.post("/:id/comments", async(req: any, res: Response) => {
  res.send(200);
});

router.get("/:id/comments", routeProtector, (req, res) => {
  res.send(200);
});
export default router;
