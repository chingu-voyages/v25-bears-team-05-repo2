require("dotenv").config;
import * as express from "express";
import { routeProtector } from "../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { NotificationType } from "../models/notification/notification.types";
import { NotificationModel } from "../models/notification/notification.model";
import { dispatchNotificationToSocket }
  from "../models/notification/notification.methods";
import { ConnectionRequestModel }
  from "../models/connection-request/connection-request.model";
import { createError } from "../utils/errors";
import { UserModel } from "../models/user/user.model";

const router = express.Router();

router.post(
  "/connection/:id",
  routeProtector,
  [param("id").not().isEmpty().trim().escape()],
  async (req: any, res: any) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    const approverId = req.params.id;


    let requestorId: any;

    if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
      requestorId = req.body.testRequestorId;
    } else {
      requestorId = req.user.id;
    }

    const { isTeamMate } = req.body;

    try {
      const connectionRequest =
        await ConnectionRequestModel.generateConnectionRequest({
          requestorId,
          approverId,
          isTeamMate,
        });
      if (
        connectionRequest &&
        connectionRequest.document &&
        connectionRequest.requestExists === false
      ) {
        const notification =
          await NotificationModel.generateNotificationDocument({
            originatorId: requestorId,
            targetUserId: approverId,
            notificationType: NotificationType.ConnectionRequest,
          });
        const io = req.app.get("socketIo");
        dispatchNotificationToSocket({
          targetUserId: approverId,
          io,
          notification,
        });
        const refreshedUser = await UserModel.findById(requestorId);
        return res
          .status(200)
          .send([refreshedUser.connections, refreshedUser.connectionRequests]);
      }
      res.statusMessage = "Request already exists";
      return res.status(400).end();
    } catch (exception) {
      return res.status(500).send({
        errors: [
          {
            ...createError(
              "unable to initiate connection request due to a server error",
              `server error ${exception.message}`,
              "n/a",
            ),
          },
        ],
      });
    }
  },
);

router.delete(
  "/connection/:id",
  routeProtector,
  [
    param("id").not().isEmpty().trim().escape(),
    body("origin").not().isEmpty().trim().escape(),
  ],
  async (req: any, res: any) => {
    // req.body.origin tells us if this is a request from
    // the requestor: ie. the person who made the connection request (who is now canceling the request)
    // or the approver - this person is declining the request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }

    let requestorId = req.user.id;
    let approverId = req.params.id;

    if (req.body.origin === "requestor") {
      requestorId = req.user.id;
      approverId = req.params.id;
    } else if (req.body.origin === "approver") {
      requestorId = req.params.id;
      approverId = req.user.id;
    } else {
      res.statusMessage =
        "Invalid origin string type. It should be either 'requestor' or 'approver'";
      return res(400).end();
    }

    const refreshedRequestingUser =
      await ConnectionRequestModel.deleteConnectionRequest({
        requestorId,
        approverId,
      });
    return res
      .status(200)
      .send([
        refreshedRequestingUser.connections,
        refreshedRequestingUser.connectionRequests,
      ]);
  },
);

export default router;
