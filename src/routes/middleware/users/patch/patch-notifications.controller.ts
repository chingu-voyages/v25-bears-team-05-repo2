import { UserModel } from "../../../../models/user/user.model";
import { NotificationModel } from "../../../../models/notification/notification.model";

export const findAndMarkNotificationAsRead = async (
  req: any,
  res: any,
  next: any,
): Promise<void> => {
  const { read } = req.body;
  try {
    await NotificationModel.findByIdAndMarkAsRead({
      targetUserId: res.locals.userId,
      notificationId: req.params.notificationId,
      read,
    });
    next();
  } catch (exception) {
    res.status(404).send({
      error: exception.message,
    });
  }
};

export const refreshAndSendNotificationsToReqUser = async (
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
