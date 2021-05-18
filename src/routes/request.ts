import * as express from "express";
import { routeProtector } from "../middleware/route-protector";
import { param, validationResult } from "express-validator/check";
import { NotificationType } from "../models/notification/notification.types";
import { NotificationModel } from "../models/notification/notification.model";
import { dispatchNotificationToSocket } from "../models/notification/notification.methods";
import { ConnectionRequestModel } from "../models/connection-request/connection-request.model";
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
    const requestorId = req.user.id;

    try {
      const connectionRequest =
        await ConnectionRequestModel.generateConnectionRequest({
          requestorId,
          approverId,
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
        const refreshedUser = await UserModel.findById(req.user.id);
        return res
          .status(200)
          .send([refreshedUser.connections, refreshedUser.connectionRequests]);
      }
      return res.status(400).send("Request already exists");
    } catch (exception) {
      return res.status(500).send({
        errors: [
          {
            ...createError(
              "unable to initiate connection request due to a server error",
              `server error ${exception.text}`,
              "n/a"
            ),
          },
        ],
      });
    }
  }
);

export default router;
