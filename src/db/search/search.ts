import { IUserDocument } from "../../models/user/user.types";
import { ThreadModel } from "../../models/thread/thread.model";
import { UserModel } from "../../models/user/user.model";
import { IPublicUserDetails, IThreadDetails } from "./search.types";
import { IThreadDocument } from "../../models/thread/thread.types";

/**
 *
 * @param query Will search resources to match query parameters
 */
export async function search(query: string) {
  const users = await UserModel.find();
  const threads = await ThreadModel.find();

  const userResults = getUserSearchResults(users, query.toLowerCase());
  const threadResults = getThreadSearchResults(threads, query.toLowerCase());

  return {
    users: userResults,
    threads: threadResults
  };
}

export function getUserSearchResults(docs: IUserDocument[], query: string): IPublicUserDetails[] {
  return docs.filter((doc) => {
    return doc.firstName.toLowerCase().includes(query) ||
      doc.lastName.toLowerCase().includes(query) ||
      doc.firstName.toLowerCase() + " " + doc.lastName.toLowerCase().includes(query) ||
      doc.jobTitle && doc.jobTitle.toLowerCase().includes(query);
  }).map((user) => {
    return {
      id: user.id.toString(),
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle
    };
  });
}

export function getThreadSearchResults(docs: IThreadDocument[], query: string): IThreadDetails[] {
  return docs.filter((doc) => {
    return doc.content.html.toLowerCase().includes(query) ||
    doc.content.hashTags.some(hashTag => hashTag.toLowerCase().includes(query));
  }).map((thread) => {
    return {
      postedByUserId: thread.id.toString(),
      threadType: thread.threadType,
      content: {
        html: thread.content.html,
        hashTags: thread.content.hashTags,
        attachments: thread.content.attachments
      },
      likes: Object.keys(thread.likes).length,
      shares: Object.keys(thread.shares).length,
      updatedAt: thread.updatedAt
    };
  });
}
