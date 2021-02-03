import { model } from "mongoose";
import { IThreadDocument, IThreadModel } from "./thread.types";
import ThreadSchema from "./thread.schema";
import feedUpdator from "../../middleware/feed-updator";

feedUpdator(ThreadSchema);

export const ThreadModel = model<IThreadDocument, IThreadModel>("thread", ThreadSchema, "threads");
