import { Schema } from "mongoose";

const PasswordRecoverySchema: Schema = new Schema(
  {
    requestClosedDate: { type: Date, default: null },
		requestorEmail: { type: String, default: "" },
    requestClaimed: { type: Boolean, default: false }
  },
  { timestamps: {} }
);

export default PasswordRecoverySchema;
