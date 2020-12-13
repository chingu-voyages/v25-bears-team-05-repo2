import { ThreadVisibility } from "../../../models/thread/thread.types";
import * as _ from "lodash";
import { IUserThread } from "../../../models/user/user.types";

/**
 * Uses lodash to go through the started and shared Thread objects and filter out any
 * whose visibility property is not Anyone (or 0)
 * @param sourceThread The entire IUser.threads object
 */
export function getVisibleThreads(sourceThread: IUserThread): IUserThread {
  const filteredStartedObjectKeys: string[] = [];
  const filteredSharedObjectKeys: string[] = [];
  if (sourceThread.started) {
    for (const [key, _] of Object.entries(sourceThread.started)) {
      if (sourceThread.started[key].visibility === ThreadVisibility.Anyone) {
        filteredStartedObjectKeys.push(key);
      }
    }
    sourceThread.started = _.pick(sourceThread.started, filteredStartedObjectKeys);
  }

  if (sourceThread.shared) {
    for (const [key, _] of Object.entries(sourceThread.shared)) {
      if (sourceThread.shared[key].visibility === ThreadVisibility.Anyone) {
        filteredSharedObjectKeys.push(key);
      }
    }
    sourceThread.shared = _.pick(sourceThread.shared, filteredSharedObjectKeys);
  }
  return sourceThread;
}
