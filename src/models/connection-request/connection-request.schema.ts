import { Schema } from "mongoose";
import { deleteConnectionRequest, generateConnectionRequest } from "./connection-request.methods";

const ConnectionRequestSchema = new Schema(
  {
    requestorId: String,
    approverId: String,
  },
  { timestamps: true }
);

ConnectionRequestSchema.statics.generateConnectionRequest = generateConnectionRequest;
ConnectionRequestSchema.statics.deleteConnectionRequest = deleteConnectionRequest;

export default ConnectionRequestSchema;
