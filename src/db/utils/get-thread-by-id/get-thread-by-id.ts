
import { ThreadModel } from "../../../models/thread/thread.model";
import { IThreadResponse } from "../../../db/types";
/**
 * Finds thread by ID and transforms data into IThreadResponse
 * @param threadId ObjectId
 */
export async function getThreadById({threadId, reqUserId}: {threadId: string, reqUserId: string}): Promise<IThreadResponse> {
  const result = await ThreadModel.findById(threadId);
  if (!result) throw new Error(`Unable to find thread for id: ${threadId}`);
  const currentUserReactions: any = {};
  const reactionsAsArray = Object.entries(result.reactions);
  reactionsAsArray.forEach(([key, value]) => {
    if (value.postedByUserId.toString() === reqUserId) {
      currentUserReactions[key] = value;
    }
  })
  return {
    id: result._id.toString(),
    postedByUserId: result.postedByUserId.toString(),
    visibility: result.visibility,
    content: result.content,
    comments: Object.values(result.comments).sort((a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()),
    reactions: result.reactions,
    reactionsCount: reactionsAsArray.length,
    currentUserReactions,
    forks: result.forks,
    aForkOfThreadId: result.aForkOfThreadId,
    updatedAt: result.updatedAt.valueOf().toString(),
    createdAt: result.createdAt.valueOf().toString(),
  };
}
