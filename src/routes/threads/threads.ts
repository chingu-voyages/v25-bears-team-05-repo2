import * as express from "express";
import { routeProtector } from "../../middleware/route-protector";
import { deleteThreadByIdValidator, deleteThreadLikeValidator, threadIdValidator,
  threadPostValidator,
  threadsPatchValidatorSanitizer,
  threadsPostLikesValidator,
} from "../middleware/threads/validators";
import { validate } from "../middleware/validator";
import { fetchThreadsById } from "../middleware/threads/get/get-thread-by-id.controller";
import { createAndPostNewThread,
  gatherThreadPostDetails }
  from "../middleware/threads/post/post-thread.controller";
import { getUserContext } from "../middleware/get-user-context";
import { completePatchOperation,
  gatherPatchUpdates }
  from "../middleware/threads/patch/patch-update-thread-by-id.controller";
import { addThreadLike } from "../middleware/threads/post";
import { deleteThreadLikeById }
  from "../middleware/threads/delete/delete-thread-like-by-id.controller";
import { deleteThreadById }
  from "../middleware/threads/delete/delete-thread-by-id.controller";
const router = express.Router();

router.get("/:id",
  routeProtector,
  threadIdValidator(),
  validate,
  fetchThreadsById,
);

router.post("/",
  routeProtector,
  threadPostValidator(),
  validate,
  getUserContext,
  gatherThreadPostDetails,
  createAndPostNewThread,
);

router.patch("/:id",
  routeProtector,
  threadsPatchValidatorSanitizer(),
  validate,
  getUserContext,
  gatherPatchUpdates,
  completePatchOperation,
);

router.post("/:id/likes",
  routeProtector,
  threadsPostLikesValidator(),
  validate,
  getUserContext,
  addThreadLike,
);


router.delete("/:id/likes",
  routeProtector,
  deleteThreadLikeValidator(),
  validate,
  getUserContext,
  deleteThreadLikeById,
);

// ** Not yet implemented
router.delete("/:thread_id", routeProtector,
  deleteThreadByIdValidator(), validate,
  getUserContext,
  deleteThreadById,
);

// ** Not yet implemented
// router.post("/:thread_id/share", [body("threadId").exists().trim().escape(),
//   body("sourceUserId").exists().trim().escape()],
// routeProtector,
// async (req: any, res: Response) => {
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).send({ errors: errors.array() });
//   }
//   try {
//     const result = await req.user.shareThread({ targetThreadId: req.body.threadId,
//       sourceUserId: req.body.sourceUserId,
//     });
//     return res.status(200).send(result);
//   } catch (err) {
//     res.status(400).send({ errors: [{ ...createError("Unable to share thread",
//       `${err}`,
//       "Error") }] });
//   }
// });

// router.delete("/:thread_id",
//   [body("threadId").exists().trim().escape()],
//   routeProtector, async (req: any, res: Response) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       return res.status(400).send({ errors: errors.array() });
//     }
//     try {
//       const result = await req.user.deleteThreadShare({
//         targetThreadShareId: req.body.threadId,
//       });
//       return res.status(200).send(result);
//     } catch (err) {
//       res.status(400).send({ errors: [{ ...createError("Unable to delete threadShare",
//         `${err}`,
//         "Error") }] });
//     }
//   });
// export default router;
