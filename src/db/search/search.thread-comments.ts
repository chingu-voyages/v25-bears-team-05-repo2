import { UserModel } from "../../models/user/user.model";
import { ThreadCommentModel } from "../../models/thread-comment/thread-comment.model";
import { ThreadVisibility } from "../../models/thread/thread.types";
import { ISearchOptions, IThreadCommentDetails } from "./search.types";
import { IThreadCommentDocument } from "../../models/thread-comment/thread-comment.types";
import { ThreadModel } from "../../models/thread/thread.model";
import { computeLimitAndSkip } from "./helpers/compute-limit-skip";

/**
 *
 * @param {object} data
 * @param {ISearchOptions} options
 * @return {Promise<IThreadCommentDetails[]>}
 */
export async function queryPublicThreadComments(
  data: {
    queryString: string;
  },
  options?: ISearchOptions,
): Promise<IThreadCommentDetails[]> {
  options = computeLimitAndSkip(options);
  const query = { "$search": data.queryString };
  const queryResults = await ThreadCommentModel.find({
    "$and": [
      { "$text": query },
      { "parentThreadVisibility": ThreadVisibility.Anyone },
    ],
  })
    .limit(options.limit)
    .skip(options.skip);

  if (queryResults) {
    return matchParentThreadWithThreadComment({
      queryResultsThreadCommentDocuments: queryResults,
    });
  }
  return [];
}

/**
 *
 * @param {object} data
 * @param {ISearchOptions} options
 * @return {Promise<IThreadCommentDetails[]>}
 */
export async function queryPrivateThreadComments(
  data: {
    requestorUserId: string;
    queryString: string;
  },
  options?: ISearchOptions,
): Promise<IThreadCommentDetails[]> {
  const requestingUser = await UserModel.findById(data.requestorUserId);
  if (!requestingUser) {
    throw new Error("Requesting user not found");
  }
  options = computeLimitAndSkip(options);

  const connectionOfUserDocuments =
    await requestingUser.getUserDocumentsFromConnections();
  if (!connectionOfUserDocuments || connectionOfUserDocuments.length === 0) {
    return [];
  }

  const connectionOfIds = connectionOfUserDocuments.map((document) =>
    document.id.toString(),
  );
  const query = { "$search": data.queryString };

  const queryResults = await ThreadCommentModel.find({
    "$and": [
      { "$text": query },
      { "parentThreadVisibility": ThreadVisibility.Connections },
      { "parentThreadOriginatorId": { "$in": connectionOfIds } },
    ],
  })
    .limit(options.limit)
    .skip(options.skip);
  return matchParentThreadWithThreadComment({
    queryResultsThreadCommentDocuments: queryResults,
  });
}

/**
 * This is a helper method that matches a parent thread to a comment that is
 * is returned in a search query
 * @param {object} data
 */
async function matchParentThreadWithThreadComment(data: {
  queryResultsThreadCommentDocuments: IThreadCommentDocument[];
}): Promise<IThreadCommentDetails[]> {
  if (data.queryResultsThreadCommentDocuments.length === 0) {
    return [];
  }

  const parentThreadIds = data.queryResultsThreadCommentDocuments.map(
    (document) => document.parentThreadId.toString(),
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
            foundThreadCommentDocument.parentThreadId.toString(),
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
      },
    );
    return matches;
  } else {
    throw new Error(
      "Please verify: found no matching parent thread documents.",
    );
  }
}
