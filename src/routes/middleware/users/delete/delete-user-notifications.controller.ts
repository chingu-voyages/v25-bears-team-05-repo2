/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { UserModel } from "../../../../models/user/user.model";

export const dismissNotification = async (
  req: any,
  res: any,
  next: any,
): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
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
