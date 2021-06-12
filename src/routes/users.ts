import * as express from "express";
import { Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { UserModel } from "../models/user/user.model";
import { IProfileData } from "../models/user/user.types";
import { decrypt } from "../utils/crypto";
import { getVisibleThreads } from "../db/utils/get-visible-threads/get-visible-threads";
import { NotificationModel } from "../models/notification/notification.model";
import { ConnectionRequestModel } from "../models/connection-request/connection-request.model";
import { dispatchNotificationToSocket } from "../models/notification/notification.methods";
import { NotificationType } from "../models/notification/notification.types";
const router = express.Router();

router.get(
  "/:id",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    try {
      if (req.params.id === "me") {
        const homeProfileData = await getProfileById(req.user._id);
        return res.status(200).send(homeProfileData);
      } else {
        const otherUserData = await getProfileById(req.params.id);
        return res.status(200).send(otherUserData);
      }
    } catch (err) {
      if (err.message === "Unable to find profile for id") {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `invalid id ${req.params.id} ${err.message}`,
              "param": "id",
            },
          ],
        });
      }
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

router.get(
  "/:id/connections",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    if (req.params.id === "me") {
      res.status(200).send(req.user.connections);
    } else {
      try {
        const otherUser = await UserModel.findById(req.params.id);
        if (otherUser) {
          return res.status(200).send(otherUser.connections);
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
    }
  },
);

/**
 * Handles connection request approval */
router.put(
  "/:id/connections",
  routeProtector,
  [
    param("id").not().isEmpty().trim().escape(),
    body("connectionRequestDocumentId").not().isEmpty().trim().escape(),
  ],
  async (req: any, res: Response) => {
    if (req.params.id === "me" || req.params.id === req.user.id) {
      return res.status(400).send({
        errors: [
          {
            "location": "/users/:id/connections",
            "msg": "Can't use 'me' or own id in this type of request",
            "param": "id",
          },
        ],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const connectionReqDocumentId = req.body.connectionRequestDocumentId;

    try {
      const connectionRequestDocument = await ConnectionRequestModel.findById(
        connectionReqDocumentId,
      );
      if (!connectionRequestDocument) {
        res.statusMessage = "request not found or no longer exists";
        return res.status(400).end();
      }
      if (connectionRequestDocument.approverId !== req.user.id) {
        return res.status(400).send({
          errors: [
            {
              "location": "/users/connections",
              "msg": `approverId doesn't match req.user.id`,
              "param": "req.user.id",
            },
          ],
        });
      }
      if (req.params.id !== connectionRequestDocument.requestorId) {
        return res.status(400).send({
          errors: [
            {
              "location": "/users/connections",
              "msg": `requestorId does not match req.params.id`,
              "param": "req.params.id",
            },
          ],
        });
      }
      await req.user.addConnectionToUser(
        connectionRequestDocument.requestorId,
        connectionRequestDocument.isTeamMate,
      );

      await ConnectionRequestModel.deleteConnectionRequest({
        requestorId: connectionRequestDocument.requestorId,
        approverId: connectionRequestDocument.approverId,
      });

      // Notify requestor of success
      const notification = await NotificationModel.generateNotificationDocument(
        {
          originatorId: connectionRequestDocument.approverId,
          targetUserId: connectionRequestDocument.requestorId,
          notificationType: NotificationType.ConnectionRequestApproved,
        },
      );
      const io = req.app.get("socketIo");
      dispatchNotificationToSocket({
        targetUserId: connectionRequestDocument.requestorId,
        io,
        notification,
      });

      return res.status(200).send([req.user.connections]);
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

// Delete a connection
router.delete(
  "/me/connections/:targetId",
  routeProtector,
  [param("targetId").not().isEmpty().trim().escape()],
  async (req: any, res: Response) => {
    if (req.params.targetId === "me" || req.params.targetId === req.user.id) {
      return res.status(400).send({
        errors: [
          {
            "location": "param",
            "msg": "Can't use 'me' or own id in this type of request",
            "param": "id",
          },
        ],
      });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      await req.user.deleteConnectionFromUser(req.params.targetId);
      return res.status(200).send([req.user.connections]);
    } catch (err) {
      if (
        err.message.includes("is not a connection") ||
        err.message.includes("User id not found")
      ) {
        return res.status(404).send({
          errors: [
            {
              "location": "/users",
              "msg": `${err.message}`,
              "param": "id",
            },
          ],
        });
      }
      res.status(500).send({
        errors: [
          {
            "location": "/users",
            "msg": "Unknown server or database error",
            "param": "unknown",
          },
        ],
      });
    }
  },
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
            "msg": `Server error/ invalid notification id`,
            "param": "id",
          },
        ],
      });
    }
  },
);

export default router;
