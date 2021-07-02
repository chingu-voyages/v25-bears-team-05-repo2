import { UserModel } from "../../../../models/user/user.model";
import { IThreadPostDetails } from "../../../../models/thread/thread.types";

export const gatherThreadPostDetails = (req: any, res: any, next: any): void => {
  const threadDetails: IThreadPostDetails = {
    html: req.body.htmlContent,
    hashTags: req.body.hashTags,
    threadType: req.body.threadType,
    visibility: req.body.visibility,
    attachments: req.body.attachments,
  };
  res.locals.threadDetails = threadDetails;
  next();
};

export const createAndPostNewThread = async (req: any,
  res: any): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    const newData = await user.createAndPostThread(res.locals.threadDetails);
    return res.status(200).send(newData.threadData);
  } catch (exception) {
    res.status(500).send({ error: `Create thread: ${exception.message}` });
  }
};
