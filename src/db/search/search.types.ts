import { ThreadType } from "../../models/thread/thread.types";

export interface ISearchResults {
  users?: Array<IPublicUserDetails>;
  threads?: Array<IThreadDetails>;
}

export interface IPublicUserDetails {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle?: string;
}

export interface IThreadDetails {
  postedByUserId: string;
  threadType: ThreadType;
  content: {
      html: string,
      hashTags?: Array<string>,
      attachments?: Array<string>
    };
  likes?: number;
  shares?: number;
  updatedAt: Date;
}
