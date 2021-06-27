import { Router } from "express";
import { routeProtector } from "../../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { NotificationModel } from "../../models/notification/notification.model";
import {
  deleteConnectionValidationRules,
  getUserValidationRules,
  patchUserValidationRules,
  putUserConnectionsValidationRules,
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
const router = Router();

router.get(
  "/:id",
  routeProtector,
  getUserValidationRules(),
  validate,
  getUserById,
);

router.get(
  "/:id/connections",
  routeProtector,
  getUserValidationRules(),
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
  getUserValidationRules(),
  validate,
  returnThreadsForParamIdMe,
  returnThreadsForUserByParamId,
);

router.get("/me/notifications", routeProtector, getMyNotifications);

router.patch(
  "/me/notifications/:notificationId",
  routeProtector,
  [
    param("notificationId").not().isEmpty().trim().escape(),
    body("read").not().isEmpty().isBoolean(),
  ],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    const { read } = req.body;
    try {
      await NotificationModel.findByIdAndMarkAsRead({
        notificationId: req.params.notificationId,
        read,
      });
      const updatedNotifications = await req.user.getNotifications();
      return res.status(200).send(updatedNotifications);
    } catch (exception) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users/notifications",
            "msg": `Server error/ invalid notification id`,
            "param": "id",
          },
        ],
      });
    }
  },
);

router.delete(
  "/me/notifications/:notificationId",
  routeProtector,
  [param("notificationId").not().isEmpty().trim().escape()],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      await req.user.dismissNotification(req.params.notificationId);
      const updatedNotifications = await req.user.getNotifications();
      return res.status(200).send(updatedNotifications);
    } catch (exception) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users/notifications",
            "msg": `${exception}`,
            "param": "id",
          },
        ],
      });
    }
  },
);

export default router;
