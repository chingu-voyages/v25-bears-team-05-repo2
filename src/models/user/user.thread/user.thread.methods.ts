import { IUserDocument } from "../user.types";
import { UserModel } from "../user.model";
import {
  IThread,
  IThreadDocument,
  IThreadPostDetails,
  ThreadType,
  ThreadVisibility,
} from "../../thread/thread.types";
import { ThreadModel } from "../../thread/thread.model";
import { ThreadLikeModel } from "../../../models/thread-like/thread-like.model";
import sanitizeHtml from "sanitize-html";
import { ThreadCommentModel } from "../../../models/thread-comment/thread-comment.model";
import { IAttachmentType } from "../../../models/thread-comment/thread-comment.types";
import {
  IThreadShare,
  IThreadShareDocument,
} from "../../../models/thread-share/thread-share.types";
import { deleteUserCommentsForThreadByThreadId } from "./user.thread.deletion.methods";

/**
 *
 * @param this instance of IUserDocument
 * @param threadDetails data used to make a thread
 */
export async function createAndPostThread(
  this: IUserDocument,
  threadDetails: IThreadPostDetails
) {
  const userThread: IThread = {
    threadType: threadDetails.threadType,
    visibility: threadDetails.visibility,
    postedByUserId: this.id,
    content: {
      html: sanitizeHtml(threadDetails.html),
      attachments: threadDetails.attachments,
      hashTags: threadDetails.hashTags,
      updatedAt: new Date(),
      createdAt: new Date(),
    },
    comments: {},
    likes: {},
    shares: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const newlyCreatedThread = await ThreadModel.create(userThread);
  this["threads"]["started"][
    `${newlyCreatedThread.id.toString()}`
  ] = newlyCreatedThread;
  // Forces the parent object to update: there may be a better way
  this.markModified("threads");
  await this.save();
  return { userData: this, threadData: newlyCreatedThread };
}

export async function deleteThread(
  this: IUserDocument,
  threadDetails: { targetThreadId: string }
) {
  // Rules: user can only delete a thread they started.
  if (this.threads.started[threadDetails.targetThreadId]) {
    delete this.threads.started[threadDetails.targetThreadId];
    this.markModified("threads");
    await this.save();
    await deleteUserCommentsForThreadByThreadId({
      sourceThreadId: threadDetails.targetThreadId,
    });
    return this.threads.started;
  } else {
    throw new Error(
      `Thread not found on user object with id: ${threadDetails.targetThreadId}: unable to delete`
    );
  }
}

/** This is a modular helper method. This will only
 * return a sorted list (by date latest) of threads from source user's connections
 */
export async function getConnectionThreads(
  this: IUserDocument
): Promise<Array<IThread>> {
  // Get an array of userIds for this.connections
  const connectionUserIds = [...Object.keys(this.connections), this.id];

  // Find user documents that match the ids in the above array
  const users = await UserModel.find()
    .where("_id")
    .in(connectionUserIds)
    .exec();
  const threads: IThread[] = [];

  users.forEach((user) => {
    for (const [_, value] of Object.entries(user.threads.started)) {
      threads.push(value);
    }
  });

  return threads.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}

export async function addLikeToThread(
  this: IUserDocument,
  data: { targetThreadId: string; title: string }
) {
  // Find the thread
  // Create the like object
  // Add like object to thread
  // Add the thread to the likes object on the user

  const targetThread = await ThreadModel.findById(data.targetThreadId);
  if (targetThread) {
    // User can't like own thread

    if (targetThread.postedByUserId === this.id.toString()) {
      throw new Error("Cannot like own thread");
    }
    // Create the like object
    const threadLikeDocument = await ThreadLikeModel.create({
      postedByUserId: this.id,
      title: data.title,
    });
    targetThread.likes[
      `${threadLikeDocument._id.toString()}`
    ] = threadLikeDocument;
    targetThread.markModified("likes");
    this.threads.liked[`${targetThread.id.toString()}`] = threadLikeDocument;
    this.markModified("threads");
    await this.save();
    const threadDoc = await targetThread.save();
    return {
      updatedThread: threadDoc,
      threadLikeDocument: threadLikeDocument,
    };
  }
}

export async function deleteLikeFromThread(
  this: IUserDocument,
  data: { targetThreadId: string; targetLikeId: string }
): Promise<{ updatedThread: IThreadDocument }> {
  // Find the thread
  const targetThread = await ThreadModel.findById(data.targetThreadId);

  // Find the like and validate that it's by the user requesting
  const like = targetThread.likes[`${data.targetLikeId}`];

  if (like && like.postedByUserId.toString() === this.id.toString()) {
    if (like._id.toString() === data.targetLikeId) {
      delete targetThread.likes[`${data.targetLikeId}`];
      targetThread.markModified("likes");

      // Delete it from the requesting user's document
      delete this.threads.liked[`${data.targetThreadId.toString()}`];
      this.markModified("threads");
      await targetThread.save();
      await this.save();
      return {
        updatedThread: targetThread,
      };
    } else {
      throw new Error("ThreadLike id not found");
    }
  } else {
    throw new Error("Unable to delete like from thread.");
  }
}

/**
 * Adds a comment to a thread and updates necessary documents
 * @param this *
 * @param data
 */
export async function addThreadComment(
  this: IUserDocument,
  data: {
    targetThreadId: string;
    threadCommentData: {
      content: string;
      attachments?: Array<IAttachmentType>;
    };
  }
) {
  const targetThread = await ThreadModel.findById(data.targetThreadId);

  if (targetThread) {
    // Create a thread
    const newThreadComment = await ThreadCommentModel.create({
      postedByUserId: this.id.toString(),
      ...data.threadCommentData,
      parentThreadId: targetThread.id.toString(),
      parentThreadVisibility: targetThread.visibility,
      parentThreadOriginatorId: targetThread.postedByUserId.toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    newThreadComment.postedByUserId = this.id.toString();

    targetThread.comments[
      `${newThreadComment.id.toString()}`
    ] = newThreadComment;
    targetThread.markModified("comments");

    // Update the User of the creator of the parent thread
    const sourceUser = await UserModel.findById(
      targetThread.postedByUserId.toString()
    );
    if (sourceUser) {
      sourceUser.threads.started[targetThread._id.toString()]["comments"] = {
        [`${newThreadComment._id.toString()}`]: newThreadComment,
      };
      sourceUser.markModified("threads");
      await sourceUser.save();
    } else {
      throw new Error("Source user was not found (thread comment");
    }

    if (!this.threads.commented[`${targetThread.id.toString()}`]) {
      this.threads.commented[`${targetThread.id.toString()}`] = {};
      this.threads.commented[`${targetThread.id.toString()}`][
        `${newThreadComment.id.toString()}`
      ] = newThreadComment;
    } else {
      this.threads.commented[`${targetThread.id.toString()}`] = {
        ...this.threads.commented[`${targetThread.id.toString()}`],
        [`${newThreadComment.id.toString()}`]: newThreadComment,
      };
    }
    this.markModified("threads");
    await this.save();
    await targetThread.save();
    await newThreadComment.save();
    return {
      updatedThread: targetThread,
      newComment: newThreadComment,
    };
  }
}

/**
 *
 * @param this
 * @param data
 */
export async function deleteThreadComment(
  this: IUserDocument,
  data: { targetThreadId: string; targetThreadCommentId: string }
) {
  const targetThread = await ThreadModel.findById(data.targetThreadId);

  if (!targetThread) {
    throw new Error("Parent thread not found");
  }
  if (!targetThread.comments[data.targetThreadCommentId]) {
    throw new Error("Thread comment not found");
  }

  await ThreadCommentModel.findByIdAndDelete(data.targetThreadCommentId);

  if (
    this.threads.commented[targetThread.id.toString()][
      data.targetThreadCommentId
    ]
  ) {
    const targetThreadId = targetThread.id.toString();
    delete this.threads.commented[targetThreadId][data.targetThreadCommentId];
    delete targetThread.comments[data.targetThreadCommentId];
    targetThread.markModified("comments");
    this.markModified("threads");
    await targetThread.save();
    await this.save();
    return {
      updatedThread: targetThread,
    };
  } else {
    throw new Error("Thread comment not found on user object");
  }
}

/**
 *
 * @param this Instance of a User
 * @param data the thread to share on user's profile
 */
export async function shareThread(
  this: IUserDocument,
  data: {
    targetThreadId: string;
    sourceUserId: string;
    threadShareType: ThreadType;
    visibility?: ThreadVisibility;
  }
) {
  // The targetThreadId has to exist on the source user.
  // The targetThreadId must be a public thread (cannot share private)
  // ThreadShares (the shared object on the Thread document) is stored by the sharer's userId.

  // First find the thread in the collection
  const targetThreadFromCollection = await ThreadModel.findById(
    data.targetThreadId.toString()
  );
  if (!targetThreadFromCollection) {
    throw new Error("Target thread not found in collection");
  }

  if (targetThreadFromCollection.visibility != ThreadVisibility.Anyone) {
    throw new Error("Unable to share due to privacy settings");
  }

  // Find the source user
  const sourceUser = await UserModel.findById(data.sourceUserId.toString());
  if (!sourceUser) {
    throw new Error(`User with id ${data.sourceUserId} is not found`);
  }

  // Find the actual thread
  if (sourceUser.threads.started[targetThreadFromCollection.id.toString()]) {
    // Update the thread object for the collection, and updated this.shared
    if (targetThreadFromCollection.shares === undefined) {
      targetThreadFromCollection.shares = {};
    }
    if (!this.threads.shared) {
      this.threads.shared = {};
    }

    const threadShare: IThreadShare = {
      threadShareType: data.threadShareType,
      postedByUserId: targetThreadFromCollection.postedByUserId,
      visibility: data.visibility || ThreadVisibility.Anyone,
      content: targetThreadFromCollection.content,
      threadType: targetThreadFromCollection.threadType,
      comments: targetThreadFromCollection.comments,
      likes: targetThreadFromCollection.likes,
      shares: {}, // targetThreadFromCollection.shares,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    targetThreadFromCollection.shares[this._id] = threadShare;
    targetThreadFromCollection.markModified("shares");
    this.threads.shared[
      targetThreadFromCollection.id.toString()
    ] = targetThreadFromCollection as IThreadShareDocument;
    this.markModified("threads");

    await this.save();
    await targetThreadFromCollection.save();

    return {
      updatedSharedThreads: this.threads.shared,
      updatedThreadDocument: targetThreadFromCollection,
    };
  } else {
    throw new Error(
      `Thread with id ${targetThreadFromCollection.id.toString()} does not exist on user's threads.started object`
    );
  }
}

/**
 * Deletes a thread share from user's own thread share object. It
 * @param this instance of UserDocument
 * @param data
 */
export async function deleteThreadShare(
  this: IUserDocument,
  data: { targetThreadShareId: string }
) {
  // Get all needed objects
  const sourceThread = await ThreadModel.findById(data.targetThreadShareId);

  if (this.threads.shared[data.targetThreadShareId]) {
    delete this.threads.shared[data.targetThreadShareId];
    this.markModified("threads");
    await this.save();

    // Update the other documents
    if (sourceThread) {
      if (sourceThread.shares[this.id.toString()]) {
        delete sourceThread.shares[this.id.toString()];
        sourceThread.markModified("shares");
        await sourceThread.save();
        return {
          updatedSharedThreads: this.threads.shared,
          updatedThreadDocument: sourceThread,
        };
      }
    } else {
      console.warn("Thread not found in thread collection");
      return {
        updatedSharedThreads: this.threads.shared,
        updatedThreadDocument: sourceThread,
      };
    }
  } else {
    throw new Error("Thread share wasn't found in user's thread share object");
  }
}
