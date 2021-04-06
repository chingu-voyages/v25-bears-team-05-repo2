import { Schema } from "mongoose";

const PasswordRecoverySchema: Schema = new Schema(
  {
    requestId: { type: String, default: null },
    requestClosedDate: { type: Date, default: null },
    requestorEmail: { type: String, default: null },
    requestClaimed: { type: Boolean, default: false },
  },
  { timestamps: {} }
);

export default PasswordRecoverySchema;
