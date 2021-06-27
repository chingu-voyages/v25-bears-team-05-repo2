import { Response, Router } from "express";
import { routeProtector } from "../../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { UserModel } from "../../models/user/user.model";
import { IProfileData } from "../../models/user/user.types";
import { decrypt } from "../../utils/crypto";
import { getVisibleThreads }
  from "../../db/utils/get-visible-threads/get-visible-threads";
import { NotificationModel } from "../../models/notification/notification.model";
import { deleteConnectionValidationRules, getUserValidationRules,
  putUserConnectionsValidationRules } from "../middleware/users/validators/validators";
import { validate } from "../middleware/validator";
import { getUserById } from "../middleware/users/get/get-user-by-id.controller";
import { getUserConnectionsById }
  from "../middleware/users/get/get-connections-by-id.controller";
import { addConnectionToUser,
  deleteConnectionRequest,
  dispatchNotification,
  finalizeAndSendRequestorConnections,
  generateNotificationDocument,
  getConnectionRequestDocument,
  validateApproverIsReqUser,
  validateParamIdIsConnectionRequestDocumentRequestor,
  validateUserIsNotMeOrSelf }
  from "../middleware/users/put/put-user-connections.controller";
import { deleteConnectionFromReqUserAndReturn,
  validateTargetIdNotMeOrTargetIsNotReqUser }
  from "../middleware/users/delete/delete-connection.controller";
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
  [
    body("firstName").trim().escape(),
    body("lastName").trim().escape(),
    body("avatar").custom((value) => {
      if (value) {
        try {
          new URL(value);
          return true;
        } catch (err) {
          return false;
        }
      } else {
        return true;
      }
    }),
    sanitizeBody("avatar").customSanitizer((value) => {
      return value.trim();
    }),
    body("jobTitle").trim().escape(),
    param("id").not().isEmpty().trim().escape(),
  ],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    if (req.params.id !== "me") {
      return res.status(400).send({
        errors: [
          {
            "location": "/users",
            "msg": `Id must be 'me'`,
            "param": "id",
          },
        ],
      });
    }
    const profileUpdateRequest: IProfileData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      jobTitle: req.body.jobTitle,
      avatarUrl: req.body.avatar,
    };

    try {
      await req.user.updateUserProfile(profileUpdateRequest);
      return res.status(200).send({
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        jobTitle: req.user.jobTitle,
        avatar: req.body.avatar,
        email: decrypt(req.user.auth.email),
      });
    } catch (err) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `Unable to complete. ${err.message}`,
            "param": "null",
          },
        ],
      });
    }
  },
);

/**
 * This gets threads object for user with id. If id=me, gets own thread object
 */
router.get(
  "/:id/threads",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    if (req.params.id === "me") {
      return res
        .status(200)
        .send({ id: req.user.id, threads: req.user.threads });
    }

    try {
      const targetUser = await UserModel.findById(req.params.id);
      if (targetUser) {
        // If user is a connection, return all threads
        // If not a connection, only return threads with a "anyone" visibility
        if (targetUser.connections[req.user.id] !== undefined) {
          return res.status(200).send({
            id: targetUser.id.toString(),
            threads: targetUser.threads,
          });
        } else {
          const onlyVisibleThreads = getVisibleThreads(targetUser.threads);
          return res.status(200).send({
            id: targetUser.id.toString(),
            threads: onlyVisibleThreads,
          });
        }
      } else {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `User ${req.params.id} not found`,
              "param": "id",
            },
          ],
        });
      }
    } catch (err) {
      return res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": `${err.message}`,
            "param": "unknown",
          },
        ],
      });
    }
  },
);

router.get("/me/notifications", routeProtector, async (req: any, res: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  const notifications = await req.user.getNotifications();
  return res.status(200).send(notifications);
});

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
