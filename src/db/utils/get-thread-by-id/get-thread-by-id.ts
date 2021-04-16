import { ThreadModel } from "../../../models/thread/thread.model";
/**
 * Finds user by ID and only returns relevant properties
 * @param threadId ObjectId
 */
export async function getThreadById({threadId}: {threadId: string}) {
  return await ThreadModel.findById(threadId);
}
