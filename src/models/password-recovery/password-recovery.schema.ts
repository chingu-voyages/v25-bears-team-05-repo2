import { Schema } from "mongoose";
import { findAllRequestsByEmailId, findRequestByEmailAndAuthToken, fulfill } from "./password-recovery.methods";

const PasswordRecoverySchema: Schema = new Schema(
  {
    authToken: { type: String, default: null },
    requestClosedDate: { type: Date, default: null },
    requestClosed: { type: Boolean, default: false },
    forAccountEmail: { type: String },
    requestIsClaimed: { type: Boolean, default: false },
    requestorIpAddress: { type: String, default: null },
    requestExpiryDate: {
      type: Date,
      default: null
    },
  },
  { timestamps: true }
);

PasswordRecoverySchema.statics.findAllRequestsByEmailId = findAllRequestsByEmailId;
PasswordRecoverySchema.statics.findRequestByEmailAndAuthToken = findRequestByEmailAndAuthToken;
PasswordRecoverySchema.methods.fulfill = fulfill;
export default PasswordRecoverySchema;
