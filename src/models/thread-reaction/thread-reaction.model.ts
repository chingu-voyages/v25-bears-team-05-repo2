import { model } from "mongoose";
import { IThreadReactionDocument, IThreadReactionModel } from "./thread-reaction.types";
import ThreadReactionSchema from "./thread-reaction.schema";
import feedUpdator from "../../middleware/feed-updator";

export const ThreadReactionModel = model<IThreadReactionDocument, IThreadReactionModel>("thread_reaction", feedUpdator(ThreadReactionSchema), "reaction");
