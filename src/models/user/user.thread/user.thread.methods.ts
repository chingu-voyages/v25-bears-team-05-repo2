import { IUserDocument } from "../user.types";
import { UserModel } from "../user.model";
import { IThread, IThreadDocument, IThreadPostDetails } from "../../thread/thread.types";
import { ThreadModel } from "../../thread/thread.model";
import { ThreadLikeModel } from "../../../models/thread-like/thread-like.model";
import sanitizeHtml from "sanitize-html";
import { ThreadCommentModel } from "../../../models/thread-comment/thread-comment.model";
import { IAttachmentType } from "../../../models/thread-comment/thread-comment.types";

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
      html: sanitizeHtml(threadDetails.html),
      attachments: threadDetails.attachments,
      hashTags: threadDetails.hashTags
    },
    comments: { },
    likes: { },
    shares: { },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newlyCreatedThread = await ThreadModel.create(userThread);
  this["threads"]["started"][`${newlyCreatedThread.id.toString()}`] = newlyCreatedThread;
  // Forces the parent object to update: there may be a better way
  this.markModified("threads");
  await this.save();
  return { userData: this, threadData: newlyCreatedThread};

}

/** This is a modular helper method. This will only
 * return a sorted list (by date latest) of threads from source user's connections
 */
export async function getConnectionThreads(this: IUserDocument): Promise<Array<IThread>> {
  // Get an array of userIds for this.connections
  const connectionUserIds = [...Object.keys(this.connections), this.id];

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

export async function addLikeToThread(this: IUserDocument, data: { targetThreadId: string, title: string}) {
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
    const threadLikeDocument = await ThreadLikeModel.create({ postedByUserId: this.id,  title: data.title});
    targetThread.likes[`${threadLikeDocument._id.toString()}`] = threadLikeDocument;
    targetThread.markModified("likes");
    this.threads.liked[`${targetThread.id.toString()}`] = threadLikeDocument;
    this.markModified("threads");
    await this.save();
    const threadDoc = await targetThread.save();
    return {
      updatedThread: threadDoc,
      threadLikeDocument: threadLikeDocument
    };
  }
}

export async function deleteLikeFromThread(this: IUserDocument, data: {  targetThreadId: string, targetLikeId: string }): Promise<{ updatedThread: IThreadDocument}> {
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
        updatedThread: targetThread
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
export async function addThreadComment (this: IUserDocument,
  data: { targetThreadId: string, threadCommentData:
    { content: string, attachments?: Array<IAttachmentType>} }) {
  const targetThread = await ThreadModel.findById(data.targetThreadId);

  if (targetThread) {
    // Create a thread
    const newThreadComment = await ThreadCommentModel.create(
      { postedByUser: this.id.toString(),
        ...data.threadCommentData});
        newThreadComment.postedByUserId = this.id.toString();

    targetThread.comments[`${newThreadComment.id.toString()}`] = newThreadComment;
    targetThread.markModified("comments");

    if (!this.threads.commented[`${targetThread.id.toString()}`]) {
      this.threads.commented[`${targetThread.id.toString()}`] = { };
      this.threads.commented[`${targetThread.id.toString()}`][`${newThreadComment.id.toString()}`] = newThreadComment;
    } else {
      this.threads.commented[`${targetThread.id.toString()}`] = { ...this.threads.commented[`${targetThread.id.toString()}`],
      [`${newThreadComment.id.toString()}`]: newThreadComment };
    }
    this.markModified("threads");
    await this.save();
    await targetThread.save();
    return {
      updatedThread: targetThread,
      newComment: newThreadComment
    };
  }
}

/**
 *
 * @param this
 * @param data
 */
export async function deleteThreadComment (this: IUserDocument, data: { targetThreadId: string, targetThreadCommentId: string }) {
  const targetThread = await ThreadModel.findById(data.targetThreadId);
  if (targetThread) {
    if (targetThread.comments[`${data.targetThreadCommentId}`]) {
      delete targetThread.comments[`${data.targetThreadCommentId}`];
      targetThread.markModified("comments");

      // Delete it from the user doc
      delete this.threads.commented[`${targetThread.id.toString()}`][`${data.targetThreadCommentId}`];
      this.markModified("threads");
      await targetThread.save();
      await this.save();
      return {
        updatedThread: targetThread
      };
    } else {
      throw new Error("Thread comment not found");
    }
  } else {
    throw new Error("Parent thread not found");
  }
}
