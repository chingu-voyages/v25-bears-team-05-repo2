import * as express from "express";
import { routeProtector } from "../middleware/route-protector";
// import { body, param, validationResult } from "express-validator/check";
// import { sanitizeBody } from "express-validator/filter";


const router = express.Router();

router.post("/connection", routeProtector, async (req: any, res: any) => {

})

// TESTING
    // const io = req.app.get("socketIo");
    // // TESTING
    // const targetUser = req.params.id;
    // const notification = await NotificationModel.generateNotificationDocument({
    //   originatorId: req.user.id,
    //   targetUserId: targetUser,
    //   notificationType: NotificationType.ConnectionRequest,
    // });
    // dispatchNotificationToSocket({
    //   io: io,
    //   targetUserId: targetUser,
    //   notification,
    // });
    // return res.status(200).send("placeholder, notification sent");

export default router;
