import { ThreadType, ThreadVisibility } from "../../models/thread/thread.types";

export interface ISearchResults {
  query_string: string;
  users?: Array<IPublicUserDetails>;
  public_threads?: Array<IThreadDetails>;
  private_threads?: Array<IThreadDetails>;
  public_thread_comments?: Array<IThreadCommentDetails>;
  private_thread_comments?: Array<IThreadCommentDetails>;
}

export interface ISearchOptions {
  limit?: number;
  skip?: number;
}
export interface ISearchRequestParams {
  queryString: string;
  requestorId: string;
  options?: ISearchOptions;
}

export interface IPublicUserDetails {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
  avatarUrls?: Array<{ url: string }>;
}

export interface IThreadDetails {
  id: string;
  postedByUserId: string;
  threadType: ThreadType;
  content: {
    html: string;
    attachments?: Array<string>;
  };
  visibility: ThreadVisibility;
  reactions?: number;
  forks?: number;
  updatedAt: Date;
}

export interface IParentThreadDetails {
  id: string;
  postedByUserId: string;
  visibility: ThreadVisibility;
  content: {
    html: string;
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
