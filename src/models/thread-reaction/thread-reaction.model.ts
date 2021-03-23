import { model } from "mongoose";
import { IThreadReactionDocument, IThreadReactionModel } from "./thread-reaction.types";
import ThreadReactionSchema from "./thread-reaction.schema";

export const ThreadReactionModel = model<IThreadReactionDocument, IThreadReactionModel>("thread_reaction", ThreadReactionSchema);
