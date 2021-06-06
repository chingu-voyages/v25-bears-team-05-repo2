import { IThreadDocument, ThreadVisibility } from "../../models/thread/thread.types";
import { ThreadModel } from "../../models/thread/thread.model";
import { ISearchOptions, IThreadDetails } from "./search.types";
import { UserModel } from "../../models/user/user.model";
import { computeLimitAndSkip } from "./helpers/compute-limit-skip";

/**
 *
 * @param {object} data
 * @param {ISearchOptions} options
 * @return {Promise<IThreadDetails[]>}
 */
export async function queryPublicThreads(
  data: {
    queryString: string;
  },
  options?: ISearchOptions,
): Promise<IThreadDetails[]> {
  const query = { "$search": data.queryString };
  options = computeLimitAndSkip(options);
  const queryResults = await ThreadModel.find({
    "$and": [{ "$text": query }, { "visibility": ThreadVisibility.Anyone }],
  })
    .limit(options.limit)
    .skip(options.skip);

  if (queryResults) {
    return mapQueryResults(queryResults);
  }
  return [];
}

/**
 *
 * @param {object} data
 * @param {ISearchOptions} options
 * @return {Promise<IThreadDetails[]>}
 */
export async function queryPrivateThreads(
  data: {
    requestorUserId: string;
    queryString: string;
  },
  options?: ISearchOptions,
): Promise<IThreadDetails[]> {
  const requestingUser = await UserModel.findById(data.requestorUserId);
  if (!requestingUser) {
    throw new Error("Requesting user not found");
  }
  options = computeLimitAndSkip(options);
  const connections = await requestingUser.getUserDocumentsFromConnections();
  if (connections && connections.length > 0) {
    const connectionIds = connections.map((user) =>
      user._id.toString(),
    );
    const query = { "$search": data.queryString };
    const queryResults = await ThreadModel.find({
      "$and": [
        { "$text": query },
        { "visibility": ThreadVisibility.Connections },
        { "postedByUserId": { "$in": connectionIds } },
      ],
    })
      .limit(options.limit)
      .skip(options.skip);

    if (queryResults) {
      return mapQueryResults(queryResults);
    }
  } else return [];
}

/**
 *  helper function that maps query results to
 * ThreadDetails format
 * @param {IThreadDocument[]} queryResults
 * @return {IThreadDetails[]}
 */
function mapQueryResults(queryResults: IThreadDocument[]): IThreadDetails[] {
  return queryResults.map((result) => {
    return {
      id: result._id.toString(),
      postedByUserId: result.postedByUserId.toString(),
      threadType: result.threadType,
      content: result.content,
      visibility: result.visibility,
      likes: (result.likes && Object.entries(result.likes).length) || 0,
      shares: (result.shares && Object.entries(result.shares).length) || 0,
      updatedAt: result.updatedAt,
    };
  });
}
