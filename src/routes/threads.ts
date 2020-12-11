import * as express from "express";
import { Response } from "express";
import { body, param, validationResult } from "express-validator/check";
import { IThreadPatchData, IThreadPostDetails } from "../models/thread/thread.types";
import { routeProtector } from "../middleware/route-protector";
import { createError } from "../utils/errors";
import { UserModel } from "../models/user/user.model";
import { sanitizeBody } from "express-validator/filter";
import { ThreadModel } from "../models/thread/thread.model";
const router = express.Router();

router.post("/", routeProtector, [body("htmlContent").not().isEmpty().trim(), // Unsure whether or not to escape here?
body("threadType").isNumeric().not().isEmpty(),
body("visibility").not().isEmpty().isInt(), body("hashTags").custom((value) => {
  if (!value) {
    return true;
  }
  return Array.isArray(value);
}),
body("attachments").custom((value) => {
  if (!value) {
    return true;
  }
  return Array.isArray(value);
}),
sanitizeBody("hashTags"),
sanitizeBody("htmlContent"),
sanitizeBody("attachments")],
async(req: any, res: Response) => {
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
    res.status(400).send({ errors: [{ ...createError("create thread POST request",
    `database error. ${err.Message}`,
    "req.body")} ]});
  }
});

router.patch("/:id", routeProtector, [param("id").not().isEmpty().trim().escape(),
body("threadType").trim().escape(),
body("visibility").trim().escape(),
sanitizeBody("hashTags").customSanitizer((value) => {
  return value.toLowerCase();
}),
sanitizeBody("htmlContent"),
sanitizeBody("attachments"),
body("threadType").custom((value) => {
  if (value) {
    if (Number.isInteger(value)) {
      return true;
    }
    return false;
  }
  return true;
}),
body("visibility").custom((value) => {
  if (value) {
    if (Number.isInteger(value)) {
      return true;
    }
    return false;
  }
  return true;
}),
body("attachments").custom((value) => {
  if (!value) {
    return true;
  }
  return Array.isArray(value);
}),
], async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  // User should be able to update threadType, visibility, and the content
  const threadPatchUpdates: IThreadPatchData = {
    threadId: req.params.id,
    userId: req.user.id,
    threadType: req.body.threadType,
    visibility: req.body.visibility,
    htmlContent: req.body.htmlContent,
    hashTags: req.body.hashTags,
    attachments: req.body.attachments,
  };
  // Use threadModel to update
  try {
    const patchedThread = await ThreadModel.patchThread(threadPatchUpdates);
    res.status(200).send({ patchedThread});
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("patch thread POST request",
    `error. ${err.Message}`,
    "database")} ]});
  }
});

router.post("/:id/likes", routeProtector, [param("id").exists().trim().escape(),
body("title").exists().trim().escape(),
], async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const result = await req.user.addLikeToThread({ targetThreadId: req.params.id,
      title: req.body.title});
      return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Add a like to a thread",
    `error. ${err}`,
    "Server error")} ]});
  }
});


router.delete("/:id/likes", routeProtector, [param("id").exists().trim().escape(),
body("threadLikeId").exists().trim().escape()],
async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.deleteLikeFromThread({ targetThreadId: req.params.id,
      targetLikeId: req.body.threadLikeId});
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Delete a like from a thread",
    `error. ${err}`,
    "Server error")} ]});
  }
});

router.post("/:id/comments", async(req: any, res: Response) => {
  res.send(200);
});

router.get("/:id/comments", routeProtector, (req, res) => {
  res.send(200);
});
export default router;
