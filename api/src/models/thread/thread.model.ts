import { model } from "mongoose";
import { IThreadDocument, IThreadModel } from "./thread.types";
import ThreadSchema from "./thread.schema";

export const ThreadModel = model<IThreadDocument, IThreadModel>("user", ThreadSchema);
