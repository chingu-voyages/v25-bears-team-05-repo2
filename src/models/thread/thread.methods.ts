import {
  IThreadDocument,
  IThreadModel,
  IThreadPatchData,
} from "./thread.types";
import mongoose from "mongoose";
import { ThreadModel } from "./thread.model";
/**
 *
 * @param this *
 * @param excludeUserId userId of posts to exclude from the return
 */
export async function getAllPublicThreads(
  this: IThreadModel,
  excludePostedByUserIds?: string[]
): Promise<IThreadDocument[]> {
  if (excludePostedByUserIds) {
    return await this.find({
      visibility: 0,
      postedByUserId: {
        $nin: excludePostedByUserIds.map((id) => mongoose.Types.ObjectId(id)),
      },
    }).exec();
  }
  return await this.find({ visibility: 0 }).exec();
}

/**
 * Updates info on a thread document (used in patch route)
 * @param threadPatchData
 */
export async function patchThread(
  this: IThreadModel,
  data: IThreadPatchData
): Promise<IThreadDocument> {
  const targetThread = await ThreadModel.findById(data.threadId);

  if (targetThread) {
    if (data.userId.toString() !== targetThread.postedByUserId.toString()) {
      throw new Error("Unauthorized patch request");
    }

    if (data.threadType) {
      targetThread.threadType = data.threadType;
    }
    if (data.visibility) {
      targetThread.visibility = data.visibility as number;
    }
    if (data.htmlContent) {
      targetThread.content.html = data.htmlContent;
    }
    if (data.hashTags) {
      targetThread.content.hashTags = [...data.hashTags];
      targetThread.content.hashTags = Array.from(
        new Set(targetThread.content.hashTags)
      );
    }
    if (data.attachments) {
      targetThread.content.attachments = [...data.attachments];
      targetThread.content.attachments = Array.from(
        new Set(targetThread.content.attachments)
      );
    }
    targetThread.content.updatedAt = new Date();
    return await targetThread.save();
  }
  throw new Error("Thread not found");
}
