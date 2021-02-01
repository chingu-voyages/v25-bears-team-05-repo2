import { ThreadVisibility } from "../../models/thread/thread.types";
import { ThreadModel } from "../../models/thread/thread.model";
import { ISearchOptions, IThreadDetails } from "./search.types";
import { UserModel } from "../../models/user/user.model";
import { computeLimitAndSkip } from "./helpers/compute-limit-skip";

export async function queryPublicThreads(
  data: {
    queryString: string;
  },
  options?: ISearchOptions
): Promise<IThreadDetails[]> {
  const query = { "$search": data.queryString };
  options = computeLimitAndSkip(options);
  const queryResults = await ThreadModel.find({
    "$and": [{ "$text": query }, { "visibility": ThreadVisibility.Anyone }],
  })
    .limit(options.limit)
    .skip(options.skip);

  if (queryResults) {
    return queryResults.map((result) => {
      return {
        id: result._id.toString(),
        postedByUserId: result.postedByUserId.toString(),
        threadType: result.threadType,
        content: result.content,
        visibility: result.visibility,
        reactions: (result.reactions && Object.entries(result.reactions).length) || 0,
        forks: (result.forks && Object.entries(result.forks).length) || 0,
        updatedAt: result.updatedAt,
      };
    });
  }
  return [];
}

export async function queryPrivateThreads(
  data: {
    requestorUserId: string;
    queryString: string;
  },
  options?: ISearchOptions
): Promise<IThreadDetails[]> {
  const requestingUser = await UserModel.findById(data.requestorUserId);
  if (!requestingUser) {
    throw new Error("Requesting user not found");
  }
  options = computeLimitAndSkip(options);
  const connectionOfUsers = await requestingUser.getUserDocumentsFromSourceUserConnectionOf();
  if (connectionOfUsers && connectionOfUsers.length > 0) {
    const connectionOfIds = connectionOfUsers.map((user) =>
      user._id.toString()
    );
    const query = { "$search": data.queryString };
    const queryResults = await ThreadModel.find({
      "$and": [
        { "$text": query },
        { "visibility": ThreadVisibility.Connections },
        { "postedByUserId": { "$in": connectionOfIds } },
      ],
    })
      .limit(options.limit)
      .skip(options.skip);

    if (queryResults) {
      return queryResults.map((result) => {
        return {
          id: result._id.toString(),
          postedByUserId: result.postedByUserId.toString(),
          threadType: result.threadType,
          content: result.content,
          visibility: result.visibility,
          reactions: (result.reactions && Object.entries(result.reactions).length) || 0,
          forks: (result.forks && Object.entries(result.forks).length) || 0,
          updatedAt: result.updatedAt,
        };
      });
    }
  } else return [];
}
