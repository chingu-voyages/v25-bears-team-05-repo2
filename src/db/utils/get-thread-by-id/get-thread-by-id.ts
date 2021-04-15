import { ThreadModel } from "../../../models/thread/thread.model";
/**
 * Finds user by ID and only returns relevant properties
 * @param userId ObjectId
 */
export async function getThreadById({threadId}: {threadId: string}) {
  const result = await ThreadModel.findById(threadId);
  return result;
}