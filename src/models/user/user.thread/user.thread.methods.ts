import { IUserDocument, IUserThread } from "../user.types";
import { UserModel } from "../user.model";
import { IThread, IThreadDocument, IThreadPostDetails, IThreadReference, ThreadType, ThreadVisibility } from "../../thread/thread.types";
import { ThreadModel } from "../../thread/thread.model";
import { ThreadReactionModel } from "../../../models/thread-reaction/thread-reaction.model";
import sanitizeHtml from "sanitize-html";
import { ThreadCommentModel } from "../../../models/thread-comment/thread-comment.model";
import { IAttachmentType, IThreadCommentDocument, IThreadCommentReference } from "../../../models/thread-comment/thread-comment.types";
import { deleteUserCommentsForThreadByThreadId } from "./user.thread.deletion.methods";
import { IThreadReactionDocument, IThreadReactionReference } from "../../../models/thread-reaction/thread-reaction.types";

/**
 *
 * @param this instance of IUserDocument
 * @param threadDetails data used to make a thread
 */
export async function createAndPostThread(this: IUserDocument, threadDetails: IThreadPostDetails, isAFork: boolean = false) {
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
    reactions: { },
    forks: { },
    isAFork,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const newlyCreatedThread = await ThreadModel.create(userThread);
  this["threads"]["started"][`${newlyCreatedThread.id.toString()}`] = createUserThreadReference(newlyCreatedThread);
  // Forces the parent object to update: there may be a better way
  this.markModified("threads");
  await this.save();
  return { userData: this, threadData: newlyCreatedThread};
}

export async function deleteThread (this: IUserDocument, threadDetails: { targetThreadId: string }) {
  // Rules: user can only delete a thread they started.
  if (this.threads.started[threadDetails.targetThreadId]) {
    delete this.threads.started[threadDetails.targetThreadId];
    this.markModified("threads");
    await this.save();
    await deleteUserCommentsForThreadByThreadId({ sourceThreadId: threadDetails.targetThreadId});
    return this.threads.started;
  } else {
    throw new Error(`Thread not found on user object with id: ${threadDetails.targetThreadId}: unable to delete`);
  }
}

/** This is a modular helper method. This will only
 * return a sorted list (by date latest) of threads from source user's connections
 */
export async function getConnectionThreads(this: IUserDocument): Promise<Array<IThreadReference>> {
  // Get an array of userIds for this.connections
  const connectionUserIds = [...Object.keys(this.connections), this.id];

  // Find user documents that match the ids in the above array
  const users = await UserModel.find().where("_id").in(connectionUserIds).exec();
  const threads: IThreadReference[] = [];

  users.forEach((user) => {
    for (const[_, value] of Object.entries(user.threads.started)) {
      threads.push(value);
    }
  });

  return threads.sort((a, b) => b.createdAt.valueOf() - a.createdAt.valueOf());
}

export async function addReactionToThread(this: IUserDocument, data: { targetThreadId: string, title: string}) {
  // Find the thread
  // Create the reaction object
  // Add reaction object to thread
  // Add the thread to the reactions object on the user

  const targetThread = await ThreadModel.findById(data.targetThreadId);
  if (targetThread) {
    // User can't reaction own thread

    if (targetThread.postedByUserId === this.id.toString()) {
      throw new Error("Cannot reaction own thread");
    }
    // Create the reaction object
    const threadReactionDocument = await ThreadReactionModel.create({ postedByUserId: this.id, title: data.title});
    const newThreadReactionReference = createUserThreadReactionReference({threadData: targetThread, reactionData: threadReactionDocument});

    targetThread.reactions[`${threadReactionDocument._id.toString()}`] = threadReactionDocument;
    targetThread.markModified("reactions");
    
    if (!this.threads.reacted[targetThread.id]) {
      this.threads.reacted[targetThread.id] = { };
      this.threads.reacted[targetThread.id][newThreadReactionReference.reactionData.reactionId.toHexString()] = newThreadReactionReference;
    } else {
      this.threads.reacted[targetThread.id] = { 
        ...this.threads.reacted[targetThread.id],
        [newThreadReactionReference.reactionData.reactionId.toString()]: newThreadReactionReference 
      };
    }
    
    this.markModified("threads");
    await this.save();
    const threadDoc = await targetThread.save();
    return {
      updatedThread: threadDoc,
      threadReactionDocument: threadReactionDocument
    };
  }
}

export async function deleteReactionFromThread(this: IUserDocument, data: {  targetThreadId: string, targetReactionId: string }): Promise<{ updatedThread: IThreadDocument}> {
  // Find the thread
  const targetThread = await ThreadModel.findById(data.targetThreadId);

  // Find the reaction and validate that it's by the user requesting
  const reaction = targetThread.reactions[`${data.targetReactionId}`];

  if (reaction && reaction.postedByUserId.toString() === this.id.toString()) {
    if (reaction._id.toString() === data.targetReactionId) {
      delete targetThread.reactions[`${data.targetReactionId}`];
      targetThread.markModified("reactions");

      // Delete it from the requesting user's document
      delete this.threads.reacted[`${data.targetThreadId.toString()}`];
      this.markModified("threads");
      await targetThread.save();
      await this.save();
      return {
        updatedThread: targetThread
      };
    } else {
      throw new Error("ThreadReaction id not found");
    }
  } else {
    throw new Error("Unable to delete reaction from thread.");
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
    const newThreadCommentReference = createUserThreadCommentRefernce({ threadData: targetThread, commentData: newThreadComment });

    targetThread.comments[`${newThreadComment.id.toString()}`] = newThreadComment;
    targetThread.markModified("comments");

    if (!this.threads.commented[`${targetThread.id.toString()}`]) {
      this.threads.commented[`${targetThread.id.toString()}`] = { };
      this.threads.commented[`${targetThread.id.toString()}`][`${newThreadComment.id.toString()}`] = newThreadCommentReference;
    } else {
      this.threads.commented[`${targetThread.id.toString()}`] = { 
        ...this.threads.commented[`${targetThread.id.toString()}`],
        [`${newThreadComment.id.toString()}`]: newThreadCommentReference 
      };
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

  if (!targetThread) {
    throw new Error("Parent thread not found");
  }
  if (!(targetThread.comments[data.targetThreadCommentId])) {
    throw new Error("Thread comment not found");
  }

  if (this.threads.commented[targetThread.id.toString()][data.targetThreadCommentId]) {
    const targetThreadId = targetThread.id.toString();
    delete this.threads.commented[targetThreadId][data.targetThreadCommentId];
    delete targetThread.comments[data.targetThreadCommentId];
    targetThread.markModified("comments");
    this.markModified("threads");
    await targetThread.save();
    await this.save();
    return {
      updatedThread: targetThread
    };
  } else {
    throw new Error ("Thread comment not found on user object");
  }
}

/**
 *
 * @param this Instance of a User
 * @param data the thread to fork on user's profile
 */
export async function forkThread(this: IUserDocument,
  data: { targetThreadId: string,
    sourceUserId: string,
    threadForkType: ThreadType,
    visibility?: ThreadVisibility}) {
  // The targetThreadId has to exist on the source user.
  // The targetThreadId must be a public thread (cannot fork private)
  // ThreadForks (the forked object on the Thread document) is stored by the forkr's userId.

  // First find the thread in the collection
  const targetThreadFromCollection = await ThreadModel.findById(data.targetThreadId.toString());
  if (!targetThreadFromCollection) {
    throw new Error("Target thread not found in collection");
  }

  if (targetThreadFromCollection.visibility != ThreadVisibility.Anyone) {
    throw new Error("Unable to fork due to privacy settings");
  }

  // Find the source user
  const sourceUser = await UserModel.findById(data.sourceUserId.toString());
  if (!sourceUser) {
    throw new Error(`User with id ${data.sourceUserId} is not found`);
  }

  // Find the actual thread
  if (sourceUser.threads.started[targetThreadFromCollection.id.toString()]) {
    // Update the thread object for the collection, and updated this.forked
    if (targetThreadFromCollection.forks === undefined) {
      targetThreadFromCollection.forks = { };
    }

    const newClonedThread = await createAndPostThread.call(this, targetThreadFromCollection, true);
    const threadFork = newClonedThread.threadData;
    
    targetThreadFromCollection.forks[this._id] = threadFork;
    targetThreadFromCollection.markModified("forks");

    await targetThreadFromCollection.save();

    return {
      updatedUserThreads: this.threads,
      newClonedThread,
      originalThread: targetThreadFromCollection
    }
  } else {
    throw new Error(`Thread with id ${targetThreadFromCollection.id.toString()} does not exist on user's threads.started object`);
  }
}

/**
 * Deletes a thread fork from user's own thread fork object. It
 * @param this instance of UserDocument
 * @param data
 */
export async function deleteThreadFork (this: IUserDocument, data: { targetThreadForkId: string }) {
  return deleteThread.call(this, data);
}

export function createUserThreadReference(threadData: IThreadDocument): IThreadReference {
  return ({
    threadId: threadData._id,
    visibility: threadData.visibility,
    createdAt: threadData.createdAt,
    updatedAt: threadData.updatedAt,
    contentSnippet: threadData.content.html.substr(0, 150),
    postedByUserId: threadData.postedByUserId
  });
}

export function createUserThreadReactionReference({threadData, reactionData}: {threadData: IThreadDocument, reactionData: IThreadReactionDocument}): IThreadReactionReference {
  return ({
    threadData: createUserThreadReference(threadData),
    reactionData: {
      reactionId: reactionData._id,
      postedByUserId: reactionData.postedByUserId,
      title: reactionData.title,
      createdAt: reactionData.createdAt,
      updatedAt: reactionData.updatedAt
    }
  });
}

export function createUserThreadCommentRefernce({threadData, commentData}: {threadData: IThreadDocument, commentData: IThreadCommentDocument}): IThreadCommentReference {
  return ({
    threadData: createUserThreadReference(threadData),
    commentData: {
      commentId: commentData._id,
      postedByUserId: commentData.postedByUserId,
      createdAt: commentData.createdAt,
      updatedAt: commentData.updatedAt,
      contentSnippet: commentData.content.substr(0, 150)
    }
  });
}