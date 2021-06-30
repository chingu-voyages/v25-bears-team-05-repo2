/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { UserModel } from "../../../../models/user/user.model";
import { getReqUser } from "../../../utils";

export const dismissNotification = async (
  req: any,
  res: any,
  next: any,
): Promise<void> => {
  const userId = getReqUser(req);
  if (!userId) {
    return res.status(500)
      .send({ error: "Unable to get req.user.id " });
  }
  res.locals.userId = userId;
  try {
    const user = await UserModel.findById(userId);
    await user.dismissNotification(req.params.notificationId);
    next();
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};

export const refreshAndSendUpdatedNotifications = async (
  req: any,
  res: any,
): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    const updatedNotifications = await user.getNotifications();
    return res.status(200).send(updatedNotifications);
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};
