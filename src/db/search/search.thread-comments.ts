import { UserModel } from "../../models/user/user.model";
import { ThreadCommentModel } from "../../models/thread-comment/thread-comment.model";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { IThreadCommentDetails } from "./search.types";
import { IThreadCommentDocument } from "../../models/thread-comment/thread-comment.types";
import { ThreadModel } from "../../models/thread/thread.model";

export async function queryPublicThreadComments(data: {
  queryString: string;
}): Promise<IThreadCommentDetails[]> {
  const query = { "$search": data.queryString };
  const queryResults = await ThreadCommentModel.find({
    "$and": [
      { "$text": query },
      { "parentThreadVisibility": ThreadVisibility.Anyone },
    ],
  });

  if (queryResults) {
    return await matchParentThreadWithThreadComment({
      queryResultsThreadCommentDocuments: queryResults,
    });
  }
  return [];
}

export async function queryPrivateThreadComments(data: {
  requestorUserId: string;
  queryString: string;
}): Promise<IThreadCommentDetails[]> {
  const requestingUser = await UserModel.findById(data.requestorUserId);
  if (!requestingUser) {
    throw new Error("Requesting user not found");
  }

  const connectionOfUserDocuments = await requestingUser.getUserDocumentsFromSourceUserConnectionOf();
  if (!connectionOfUserDocuments || connectionOfUserDocuments.length === 0) {
    return [];
  }

  const connectionOfIds = connectionOfUserDocuments.map((document) =>
    document.id.toString()
  );
  const query = { "$search": data.queryString };

  const queryResults = await ThreadCommentModel.find({
    "$and": [
      { "$text": query },
      { "parentThreadVisibility": ThreadVisibility.Connections },
      { "parentThreadOriginatorId": { "$in": connectionOfIds } },
    ],
  });
  return await matchParentThreadWithThreadComment({
    queryResultsThreadCommentDocuments: queryResults,
  });
}

/**
 * This is a helper method that matches a parent thread to a comment that is
 * is returned in a search query
 * @param data
 */
async function matchParentThreadWithThreadComment(data: {
  queryResultsThreadCommentDocuments: IThreadCommentDocument[];
}): Promise<IThreadCommentDetails[]> {
  if (data.queryResultsThreadCommentDocuments.length === 0) {
    return [];
  }

  const parentThreadIds = data.queryResultsThreadCommentDocuments.map(
    (document) => document.parentThreadId.toString()
  );

  const matchingThreadDocuments = await ThreadModel.find({
    "_id": { "$in": parentThreadIds },
  });

  if (matchingThreadDocuments && matchingThreadDocuments.length > 0) {
    const matches: IThreadCommentDetails[] = [];

    data.queryResultsThreadCommentDocuments.forEach(
      (foundThreadCommentDocument) => {
        const fndParentThreadsMatch = matchingThreadDocuments.find(
          (document) =>
            document._id.toString() ===
            foundThreadCommentDocument.parentThreadId.toString()
        );

        if (fndParentThreadsMatch) {
          matches.push({
            id: foundThreadCommentDocument._id.toString(),
            parentThreadId: foundThreadCommentDocument.parentThreadId,
            postedByUserId: foundThreadCommentDocument.postedByUserId,
            content: foundThreadCommentDocument.content,
            createdAt: foundThreadCommentDocument.createdAt,
            updatedAt: foundThreadCommentDocument.updatedAt,
            parentThread: {
              id: fndParentThreadsMatch._id.toString(),
              postedByUserId: fndParentThreadsMatch.postedByUserId.toString(),
              content: fndParentThreadsMatch.content,
              createdAt: fndParentThreadsMatch.createdAt,
              updatedAt: fndParentThreadsMatch.updatedAt,
              visibility: fndParentThreadsMatch.visibility,
            },
          });
        } else {
          matches.push({
            id: foundThreadCommentDocument._id.toString(),
            parentThreadId: foundThreadCommentDocument.parentThreadId,
            postedByUserId: foundThreadCommentDocument.postedByUserId,
            content: foundThreadCommentDocument.content,
            createdAt: foundThreadCommentDocument.createdAt,
            updatedAt: foundThreadCommentDocument.updatedAt,
            parentThread: null,
          });
        }
      }
    );
    return matches;
  } else {
    throw new Error(
      "Please verify: found no matching parent thread documents."
    );
  }
}