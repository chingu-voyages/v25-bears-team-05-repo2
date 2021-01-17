import { UserModel } from "../../../models/user/user.model";
import { IProfile } from "../../../db/types";

/**
 * Finds user by ID and only returns relevant properties
 * @param userId ObjectId
 */
export async function getProfileById({userId, reqUserId}: {userId: string, reqUserId: string}): Promise<IProfile> {
  const result = await UserModel.findById(userId);
  if (!result) throw new Error(`Unable to find profile for id: ${userId}`);

  return {
    id: result._id.toString(),
    firstName: result.firstName,
    lastName: result.lastName,
    jobTitle: result.jobTitle,
    avatarUrls: result.avatarUrls,
    nOfConnections: Object.keys(result.connections).length, 
    isAConnection: Object.keys(result.connectionOf).includes(reqUserId),
    connections: parseConnectionsData(result.connections),
    connectionOf: parseConnectionsData(result.connectionOf),
    threads: parseThreadsData(result.threads),
    isCurrentUser: userId === reqUserId,
    updatedAt: result.updatedAt.valueOf().toString(),
    createdAt: result.createdAt.valueOf().toString(),
  };
}

function parseConnectionsData(connections: IProfile["connections"]) {
  const newConnections = {...connections};
  Object.entries(connections).forEach(([key, value]) => {
    newConnections[key] = {
      ...value, 
      userId: value.userId.toString(),
      dateTimeConnected: value.dateTimeConnected.valueOf().toString()
    };
  });
  return newConnections
}

function parseThreadsData(threads: IProfile["threads"]) {
  const newThreads = {...threads};
  Object.entries(threads.started).forEach(([key, value]) => {
    newThreads.started[key] = {
      ...value, 
      threadId: value.threadId.toString(),
      createdAt: value.createdAt.valueOf().toString(),
      updatedAt: value.updatedAt.valueOf().toString(),
      postedByUserId: value.postedByUserId.toString()
    };
  });
  Object.entries(threads.commented).forEach(([key, value]) => {
    Object.entries(value).forEach(([commentKey, commentValue]) => {
      newThreads.commented[key][commentKey] = {
        threadData: {
          ...commentValue.threadData, 
          threadId: commentValue.threadData.threadId.toString(),
          createdAt: commentValue.threadData.createdAt.valueOf().toString(),
          updatedAt: commentValue.threadData.updatedAt.valueOf().toString(),
          postedByUserId: commentValue.threadData.postedByUserId.toString()
        },
        commentData: {
          ...commentValue.commentData,
          commentId: commentValue.commentData.commentId.toString(),
          createdAt: commentValue.commentData.createdAt.valueOf().toString(),
          updatedAt: commentValue.commentData.updatedAt.valueOf().toString(),
          postedByUserId: commentValue.commentData.postedByUserId.toString()
        }
      };
    });
  });
  Object.entries(threads.reacted).forEach(([key, value]) => {
    Object.entries(value).forEach(([reactionKey, reactionValue]) => {
      newThreads.reacted[key][reactionKey] = {
        threadData: {
          ...reactionValue.threadData, 
          threadId: reactionValue.threadData.threadId.toString(),
          createdAt: reactionValue.threadData.createdAt.valueOf().toString(),
          updatedAt: reactionValue.threadData.updatedAt.valueOf().toString(),
          postedByUserId: reactionValue.threadData.postedByUserId.toString()
        },
        reactionData: {
          ...reactionValue.reactionData,
          reactionId: reactionValue.reactionData.reactionId.toString(),
          createdAt: reactionValue.reactionData.createdAt.valueOf().toString(),
          updatedAt: reactionValue.reactionData.updatedAt.valueOf().toString(),
          postedByUserId: reactionValue.reactionData.postedByUserId.toString()
        }
      };
    });
  });
  return newThreads
}