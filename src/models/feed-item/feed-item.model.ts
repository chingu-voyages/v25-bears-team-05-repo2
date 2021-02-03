import { model } from "mongoose";
import FeedItemSchema from "./feed-item.schema";
import { IFeedItemDocument } from "./feed-item.types";

export const FeedItemModel = model<IFeedItemDocument>("feed-item", FeedItemSchema, "feed");
