import { Schema } from "mongoose";

const FeedItemSchema: Schema = new Schema({
    documentId: { type: Schema.Types.ObjectId, required: true, index: true },
    documentType: { type: String, required: true },
    documentUpdatedAt: { type: Date, required: true, index: true },
    byUserId: { type: Schema.Types.ObjectId, required: true, index: true },
    action: { type: String, required: true },
    propertiesChanged: {
        type: Schema.Types.Mixed,
        default: { }
    },
}, { timestamps: { }} );

export default FeedItemSchema;