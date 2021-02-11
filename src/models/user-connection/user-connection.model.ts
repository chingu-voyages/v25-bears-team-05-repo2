import { model } from "mongoose";
import { IUserConnectionDocument, IUserConnectionModel } from "./user-connection.types";
import UserConnectionSchema from "./user-connection.schema";
import feedUpdator from "../../middleware/feed-updator";

export const UserConnectionModel = model<IUserConnectionDocument, IUserConnectionModel>("user_connection", feedUpdator(UserConnectionSchema), "connection");
