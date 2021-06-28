import { Router } from "express";
import { routeProtector } from "../../middleware/route-protector";
import {
  deleteConnectionValidationRules,
  userValidationRules,
  patchNotificationsValidationRules,
  patchUserValidationRules,
  putUserConnectionsValidationRules,
  deleteNotificationValidationRules,
} from "../middleware/users/validators/validators";
import { validate } from "../middleware/validator";
import { getUserById } from "../middleware/users/get/get-user-by-id.controller";
import { getUserConnectionsById }
  from "../middleware/users/get/get-connections-by-id.controller";
import {
  addConnectionToUser,
  deleteConnectionRequest,
  dispatchNotification,
  finalizeAndSendRequestorConnections,
  generateNotificationDocument,
  getConnectionRequestDocument,
  validateApproverIsReqUser,
  validateParamIdIsConnectionRequestDocumentRequestor,
  validateUserIsNotMeOrSelf,
} from "../middleware/users/put/put-user-connections.controller";
import {
  deleteConnectionFromReqUserAndReturn,
  validateTargetIdNotMeOrTargetIsNotReqUser,
} from "../middleware/users/delete/delete-connection.controller";
import {
  updateUserProfile,
  validateReqParamsIdIsMeOrReqUser,
} from "../middleware/users/patch";
import {
  returnThreadsForParamIdMe,
  returnThreadsForUserByParamId,
} from "../middleware/users/get";
import { getMyNotifications }
  from "../middleware/users/get/get-me-notifications.controller";
import { findAndMarkNotificationAsRead,
  refreshAndSendNotificationsToReqUser }
  from "../middleware/users/patch/patch-notifications.controller";
import { dismissNotification,
  refreshAndSendUpdatedNotifications }
  from "../middleware/users/delete/delete-user-notifications.controller";
const router = Router();

router.get(
  "/:id",
  routeProtector,
  userValidationRules(),
  validate,
  getUserById,
);

router.get(
  "/:id/connections",
  routeProtector,
  userValidationRules(),
  validate,
  getUserConnectionsById,
);

// Handles connection request approval
router.put(
  "/:id/connections",
  routeProtector,
  putUserConnectionsValidationRules(),
  validate,
  validateUserIsNotMeOrSelf,
  getConnectionRequestDocument,
  validateApproverIsReqUser,
  validateParamIdIsConnectionRequestDocumentRequestor,
  addConnectionToUser,
  deleteConnectionRequest,
  generateNotificationDocument,
  dispatchNotification,
  finalizeAndSendRequestorConnections,
);

// Delete a connection
router.delete(
  "/me/connections/:targetId",
  routeProtector,
  deleteConnectionValidationRules(),
  validate,
  validateTargetIdNotMeOrTargetIsNotReqUser,
  deleteConnectionFromReqUserAndReturn,
);

router.patch(
  "/:id",
  routeProtector,
  patchUserValidationRules(),
  validate,
  validateReqParamsIdIsMeOrReqUser,
  updateUserProfile,
);

/**
 * This gets threads object for user with id.
 * If id=me, gets own thread object
 */
router.get(
  "/:id/threads",
  routeProtector,
  userValidationRules(),
  validate,
  returnThreadsForParamIdMe,
  returnThreadsForUserByParamId,
);

router.get("/me/notifications", routeProtector, getMyNotifications);

router.patch(
  "/me/notifications/:notificationId",
  routeProtector,
  patchNotificationsValidationRules(),
  validate,
  findAndMarkNotificationAsRead,
  refreshAndSendNotificationsToReqUser,
);

router.delete(
  "/me/notifications/:notificationId",
  routeProtector,
  deleteNotificationValidationRules(),
  validate,
  dismissNotification,
  refreshAndSendUpdatedNotifications,
);

export default router;
