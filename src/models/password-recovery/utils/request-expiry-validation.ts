import dayjs from "dayjs";
import { IPasswordRecovery } from "../password-recovery.types";

export function requestIsExpired(request: IPasswordRecovery): boolean {
  return dayjs().isAfter(request.requestExpiryDate);
}

export function requestIsClaimed(request: IPasswordRecovery): boolean {
  return request.requestIsClaimed;
}
