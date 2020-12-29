import { ThreadModel } from "../../../models/thread/thread.model";
import { UserModel } from "../user.model";


export async function deleteUserCommentsForThreadByThreadId(data: { sourceThreadId: string}) {
  /* Get all the userIds of people who have commented on the source thread
   by using the postedByUser property
   */

  const sourceThread = await ThreadModel.findById(data.sourceThreadId);
  if (sourceThread) {
    const allComments = Object.values(sourceThread.comments);
    const commenterUserIds = allComments.map(comment => comment.postedByUserId);
    const users = await UserModel.find().where("_id").in(commenterUserIds).exec();
    users.forEach(async (user) => {
      delete user.threads.commented[data.sourceThreadId];
      user.markModified("threads");
    });
    await Promise.all(users.map(user => user.save()));
  } else {
    throw new Error("Thread not found");
  }
}
