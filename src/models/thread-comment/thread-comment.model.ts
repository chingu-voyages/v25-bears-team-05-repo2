import { model } from "mongoose";
import { IThreadCommentDocument, IThreadCommentModel } from "./thread-comment.types";
import ThreadCommentSchema from "./thread-comment.schema";

export const ThreadCommentModel = model<IThreadCommentDocument, IThreadCommentModel>("thread_comment", ThreadCommentSchema, "thread_comment");
