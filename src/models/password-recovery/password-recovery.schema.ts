import { Schema } from "mongoose";
import dayjs from "dayjs";
import { findAllRequestsByEmailId } from "./password-recovery.methods";


const PasswordRecoverySchema: Schema = new Schema(
  {
    authToken: { type: String, default: null },
    requestClosedDate: { type: Date, default: null },
    requestClosed: {type: Boolean, default: false },
    forAccountEmail: { type: String },
    requestIsClaimed: { type: Boolean, default: false },
    requestorIpAddress: { type: String, default: null },
    requestExpiryDate: {
      type: Date,
      default: dayjs().add(
        parseInt(process.env.PASSWORD_RECOVERY_EXPIRY_MINUTES) || 20,
        "minute"
      ),
    },
  },
  { timestamps: {} }
);

PasswordRecoverySchema.statics.findAllRequestsByEmailId = findAllRequestsByEmailId;
export default PasswordRecoverySchema;
