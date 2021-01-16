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

router.post("/:id/reactions", routeProtector, [param("id").exists().trim().escape(),
body("title").exists().trim().escape(),
], async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const result = await req.user.addReactionToThread({ targetThreadId: req.params.id,
      title: req.body.title});
      return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Add a reaction to a thread",
    `error. ${err}`,
    "Server error")} ]});
  }
});


router.delete("/:id/reactions", routeProtector, [param("id").exists().trim().escape(),
body("threadReactionId").exists().trim().escape()],
async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.deleteReactionFromThread({ targetThreadId: req.params.id,
      targetReactionId: req.body.threadReactionId});
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Delete a reaction from a thread",
    `error. ${err}`,
    "Server error")} ]});
  }
});

router.delete("/:thread_id", routeProtector,
param("thread_id").exists().trim().escape(),
async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const result = await req.user.deleteThread({ targetThreadId: req.params.thread_id });
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Unable to delete thread",
    `${err}`,
    "Error")} ]});
  }
});

router.post("/:thread_id/comments", routeProtector,
[param("thread_id").exists().trim().escape(),
body("content").exists().trim().escape(),
body("attachments").custom((value) => {
  if (!value) {
    return true;
  }
  if (Array.isArray(value)) {
    true;
  } else {
    return false;
  }
})],
async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.addThreadComment( {
      targetThreadId: req.params.thread_id,
      threadCommentData: {
        content: req.body.content, attachments: req.body.attachments
      }
    });
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Can't find thread",
    `${err}`,
    "Error")} ]});
  }
});

router.delete("/:thread_id/comments/:commentId",
[param("thread_id").exists().trim().escape(), param("commentId").exists().trim().escape()],
routeProtector, async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.deleteThreadComment({ targetThreadId: req.params.thread_id,
      targetThreadCommentId: req.params.commentId});
      return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Can't find thread",
    `${err}`,
    "Error")} ]});
  }
});

router.get("/:thread_id/comments",
[param("thread_id").exists().trim().escape()],
routeProtector, async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await ThreadModel.findById(req.params.thread_id);
    return res.status(200).send({ threadComments: result.comments});
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Can't find thread",
    `${err}`,
    "Error")} ]});
  }
});

router.post("/:thread_id/fork", [body("threadId").exists().trim().escape(),
body("sourceUserId").exists().trim().escape()],
routeProtector,
async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.forkThread({ targetThreadId: req.body.threadId,
      sourceUserId: req.body.sourceUserId
    });
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Unable to fork thread",
    `${err}`,
    "Error")} ]});
  }
});

router.delete("/:thread_id",
[body("threadId").exists().trim().escape()],
 routeProtector, async(req: any, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  try {
    const result = await req.user.deleteThreadFork({
      targetThreadForkId: req.body.threadId
    });
    return res.status(200).send(result);
  } catch (err) {
    res.status(400).send({ errors: [{ ...createError("Unable to delete threadFork",
    `${err}`,
    "Error")} ]});
  }
});
export default router;
