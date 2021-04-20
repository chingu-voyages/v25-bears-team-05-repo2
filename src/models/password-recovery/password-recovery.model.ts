import { model } from "mongoose";
import PasswordRecoverySchema from "./password-recovery.schema";
import {
  IPasswordRecoveryDocument,
  IPasswordRecoveryModel,
} from "./password-recovery.types";

export const PasswordRecoveryModel = model<
  IPasswordRecoveryDocument,
  IPasswordRecoveryModel
>("password_recovery", PasswordRecoverySchema, "password_recovery");
