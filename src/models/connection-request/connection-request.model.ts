import { model } from "mongoose";
import {
  IConnectionRequestDocument,
  IConnectionRequestModel,
} from "./connection-request.types";
import ConnectionRequestSchema from "./connection-request.schema";

export const ConnectionRequestModel = model<
  IConnectionRequestDocument,
  IConnectionRequestModel
>("connection_requests", ConnectionRequestSchema, "connection_requests");
