import { ThreadType, ThreadVisibility } from "../../models/thread/thread.types";

export interface ISearchResults {
  users?: Array<IPublicUserDetails>;
  public_threads?: Array<IThreadDetails>;
  private_threads?: Array<IThreadDetails>;
}

export interface IPublicUserDetails {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  avatars?: Array<{ url: string }>;
}

export interface IThreadDetails {
  id: string;
  postedByUserId: string;
  threadType: ThreadType;
  content: {
    html: string;
    hashTags?: Array<string>;
    attachments?: Array<string>;
  };
  visibility: ThreadVisibility;
  likes?: number;
  shares?: number;
  updatedAt: Date;
}

export interface IParentThreadDetails {
  id: string;
  postedByUserId: string;
  visibility: ThreadVisibility;
  content: {
    html: string;
    hashTags: Array<string>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IThreadCommentDetails {
  parentThread: IParentThreadDetails | null;
  id: string;
  parentThreadId: string;
  postedByUserId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
