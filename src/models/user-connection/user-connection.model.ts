import { model } from "mongoose";
import { IUserConnectionDocument, IUserConnectionModel } from "./user-connection.types";
import UserConnectionSchema from "./user-connection.schema";

export const UserConnectionModel = model<IUserConnectionDocument, IUserConnectionModel>("user_connection", UserConnectionSchema);
