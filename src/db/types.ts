import { IUserThread } from "../models/user/user.types";

export interface IProfile {
  firstName: string;
  lastName: string;
  jobTitle: string;
  avatar: Array<{ url: string}>;
  connections: any;
  connectionOf: any;
  threads: IUserThread;
  id: string;
}
