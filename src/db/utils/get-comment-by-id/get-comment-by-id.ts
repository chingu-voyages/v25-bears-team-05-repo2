import { IThreadCommentDocument } from "../../../models/thread-comment/thread-comment.types";
import { ThreadCommentModel } from "../../../models/thread-comment/thread-comment.model";

/**
 * Finds comment by ID
 * @param commentId ObjectId
 */
export async function getCommentById({commentId}: {commentId: string}): Promise<IThreadCommentDocument> {
  const result = await ThreadCommentModel.findById(commentId);
  if (!result) throw new Error(`Unable to find comment for id: ${commentId}`);
  return result;
}