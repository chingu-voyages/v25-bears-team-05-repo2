import { model } from "mongoose";
import { IThreadDocument, IThreadModel } from "./thread.types";
import ThreadSchema from "./thread.schema";

export const UserModel = model<IThreadDocument, IThreadModel>("user", ThreadSchema);
