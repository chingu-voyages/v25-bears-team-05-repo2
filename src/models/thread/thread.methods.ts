import { IThreadDocument, IThreadModel } from "./thread.types";
import mongoose from "mongoose";
/**
 *
 * @param this *
 * @param excludeUserId userId of posts to exclude from the return
 */
export async function getAllPublicThreads(this: IThreadModel, excludePostedByUserId?: string): Promise<IThreadDocument[]> {
  if (excludePostedByUserId) {
    return await this.find({ visibility: 0 , postedByUserId: { $ne: mongoose.Types.ObjectId(excludePostedByUserId) } }).exec();
  }
  return await this.find({ visibility: 0 }).exec();
}
