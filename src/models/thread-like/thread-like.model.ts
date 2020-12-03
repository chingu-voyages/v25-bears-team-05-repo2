import { model } from "mongoose";
import { IThreadLikeDocument, IThreadLikeModel } from "./thread-like.types";
import ThreadLikeSchema from "./thread-like.schema";

export const ThreadLikeModel = model<IThreadLikeDocument, IThreadLikeModel>("thread_like", ThreadLikeSchema);
