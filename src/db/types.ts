import { IUserThread } from "../models/user/user.types";

export interface IProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatar: Array<{ url: string}>;
  connections: any;
  connectionRequests: any;
  threads: IUserThread;
  id: string;
}
