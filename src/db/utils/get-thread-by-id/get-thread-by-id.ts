
import { ThreadModel } from "../../../models/thread/thread.model";
import { IThreadResponse } from "../../../db/types";
/**
 * Finds user by ID and only returns relevant properties
 * @param userId ObjectId
 */
export async function getThreadById({threadId}: {threadId: string}): Promise<IThreadResponse> {
  const result = await ThreadModel.findById(threadId);
  if (!result) throw new Error(`Unable to find thread for id: ${threadId}`);

  return {
    id: result._id.toString(),
    postedByUserId: result.postedByUserId.toString(),
    visibility: result.visibility,
    content: result.content,
    comments: Object.values(result.comments).sort((a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()),
    reactions: result.reactions,
    forks: result.forks,
    isAFork: result.isAFork,
    updatedAt: result.updatedAt.valueOf().toString(),
    createdAt: result.createdAt.valueOf().toString(),
  };
}
