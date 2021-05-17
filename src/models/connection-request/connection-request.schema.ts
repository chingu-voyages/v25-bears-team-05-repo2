import { Schema } from "mongoose";
import { generateConnectionRequest } from "./connection-request.methods";

const ConnectionRequestSchema = new Schema(
  {
    requestorId: String,
    approverId: String,
  },
  { timestamps: true }
);

ConnectionRequestSchema.statics.generateConnectionRequest = generateConnectionRequest;

export default ConnectionRequestSchema;
