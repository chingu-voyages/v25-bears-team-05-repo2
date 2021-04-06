import { Schema } from "mongoose";
import dayjs from "dayjs";

const PasswordRecoverySchema: Schema = new Schema(
  {
    requestId: { type: String, default: null },
    requestClosedDate: { type: Date, default: null },
    forAccountEmail: { type: String, default: null },
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

export default PasswordRecoverySchema;
