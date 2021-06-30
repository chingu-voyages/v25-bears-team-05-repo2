import { UserModel } from "../../../../models/user/user.model";
import { getReqUser } from "../../../utils";

export const getMyNotifications = async (req: any, res: any): Promise<void> => {
  const userId = getReqUser(req);
  if (!userId) {
    return res.status(400).send({ error: "Cannot determine req.user.id" });
  }
  try {
    const user = await UserModel.findById(userId);
    const notifications = await user.getNotifications();
    return res.status(200).send(notifications);
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};
