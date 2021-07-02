import { ThreadModel } from "../../../../models/thread/thread.model";
import { IThreadPatchData } from "../../../../models/thread/thread.types";

export const gatherPatchUpdates =(req: any, res: any, next: any): void => {
  const threadPatchUpdates: IThreadPatchData = {
    threadId: req.params.id,
    userId: res.locals.userId,
    threadType: req.body.threadType,
    visibility: req.body.visibility,
    htmlContent: req.body.htmlContent,
    hashTags: req.body.hashTags,
    attachments: req.body.attachments,
  };
  res.locals.threadPatchUpdates = threadPatchUpdates;
  next();
};

export const completePatchOperation = async (req: any, res: any): void => {
  try {
    const patchedThread = await ThreadModel.patchThread(res.locals.threadPatchUpdates);
    res.status(200).send({ patchedThread });
  } catch (err) {
    res.status(500).send({ error: "Unable to patch thread" });
  }
};
