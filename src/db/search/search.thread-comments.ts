import { ThreadCommentModel } from "../../models/thread-comment/thread-comment.model";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { IThreadCommentDetails } from "./search.types";

export async function queryPublicThreadComments(data: { queryString: string}): Promise<IThreadCommentDetails[]> {
  const query = { "$search": data.queryString };
  const queryResults = await ThreadCommentModel.find( { "$and" : [{ "$text": query }, { "parentThreadVisibility": ThreadVisibility.Anyone }]});
  
  if (queryResults) {
    return queryResults.map((result) => {
      return {
        id: result._id.toString(),
        postedByUserId: result.postedByUserId.toString(),
        content: result.content,
        parentThreadVisibility: result.parentThreadVisibility,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt
      };
    });
  }
  return [];
}
