import { ThreadVisibility } from "../../models/thread/thread.types";
import { ThreadModel } from "../../models/thread/thread.model";
import { IThreadDetails } from "./search.types";
import { UserModel } from "../../models/user/user.model";

export async function queryPublicThreads(data: {
  queryString: string;
}): Promise<IThreadDetails[]> {
  const query = { "$search": data.queryString };
  const queryResults = await ThreadModel.find({
    "$and": [{ "$text": query }, { "visibility": ThreadVisibility.Anyone }],
  });

  if (queryResults) {
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
  return [];
}

export async function queryPrivateThreads(data: {
  requestorUserId: string;
  queryString: string;
}): Promise<IThreadDetails[]> {
  const requestingUser = await UserModel.findById(data.requestorUserId);
  if (!requestingUser) {
    throw new Error("Requesting user not found");
  }

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
    });

    if (queryResults) {
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
  } else return [];
}
