import {  IUserDocument } from "./user.types";
import { UserModel } from "./user.model";
import { IThread, IThreadPostDetails } from "../thread/thread.types";
import { ThreadModel } from "../thread/thread.model";

/**
 *
 * @param this instance of IUserDocument
 * @param threadDetails data used to make a thread
 */
export async function createAndPostThread(this: IUserDocument, threadDetails: IThreadPostDetails) {
  const userThread: IThread = {
    threadType: threadDetails.threadType,
    visibility: threadDetails.visibility,
    postedByUserId: this.id,
    content: {
      html: threadDetails.html,
      attachments: threadDetails.attachments,
      hashTags: threadDetails.hashTags
    },
    comments: {},
    likes: {},
    shares: {},
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newlyCreatedThread = await ThreadModel.create(userThread);
  this["threads"]["started"][`${newlyCreatedThread.id.toString()}`] = newlyCreatedThread;
  // Forces the parent object to update: there may be a better way
  this.markModified("threads");
  await this.save();
  return {userData: this, threadData: newlyCreatedThread};

}

/** This is a modular helper method. This will only
 * return a sorted list (by date latest) of threads from source user's connections
 */
export async function getConnectionThreads(this: IUserDocument): Promise<Array<IThread>> {
  // Get an array of userIds for this.connections
  const connectionUserIds = Object.keys(this.connections);

  // Find user documents that match the ids in the above array
  const users = await UserModel.find().where("_id").in(connectionUserIds).exec();
  const threads: IThread[] = [];

  users.forEach((user) => {
    for (const[_, value] of Object.entries(user.threads.started)) {
      threads.push(value);
    }
  });

  return threads.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}
