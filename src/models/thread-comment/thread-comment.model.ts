import { model } from "mongoose";
import { IThreadCommentDocument, IThreadCommentModel } from "./thread-comment.types";
import ThreadCommentSchema from "./thread-comment.schema";
import feedUpdator from "../../middleware/feed-updator";

export const ThreadCommentModel = model<IThreadCommentDocument, IThreadCommentModel>("thread_comment", feedUpdator(ThreadCommentSchema), "comment");
