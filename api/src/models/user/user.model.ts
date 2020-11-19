// Brings the interface and schema together for a type-checked mongoose model
import { model } from "mongoose";
import { IUserDocument, IUserModel } from "./user.types";
import UserSchema from "./user.schema";

export const UserModel = model<IUserDocument, IUserModel>("user", UserSchema, "user");
