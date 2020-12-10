import { IThreadDocument, IThreadModel } from "./thread.types";
import mongoose from "mongoose";
/**
 *
 * @param this *
 * @param excludeUserId userId of posts to exclude from the return
 */
export async function getAllPublicThreads(this: IThreadModel, excludePostedByUserIds?: string[]): Promise<IThreadDocument[]> {
  if (excludePostedByUserIds) {
    return await this.find({ visibility: 0 , postedByUserId: { $nin: excludePostedByUserIds.map(id => mongoose.Types.ObjectId(id)) } }).exec();
  }
  return await this.find({ visibility: 0 }).exec();
}
