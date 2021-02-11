// Brings the interface and schema together for a type-checked mongoose model
import { model } from "mongoose";
import { IUserDocument, IUserModel } from "./user.types";
import UserSchema from "./user.schema";
import feedUpdator from "../../middleware/feed-updator";

export const UserModel = model<IUserDocument, IUserModel>("user", feedUpdator(UserSchema), "user");
