import { Schema } from "mongoose";

const ConnectionRequestSchema = new Schema(
  {
    requestorId: Schema.Types.ObjectId,
    approverId: Schema.Types.ObjectId,
  },
  { timestamps: true }
);

export default ConnectionRequestSchema;
