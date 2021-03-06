import { UserModel } from "../../../../models/user/user.model";

export const validateTargetIdNotMeOrTargetIsNotReqUser =
  (req: any, res: any, next: any): void => {
    if (req.params.targetId === "me" || req.params.targetId === res.locals.userId) {
      return res.status(400).send({
        error:
         "Can't use 'me' or own id in this type of request",
      });
    }
    next();
  };

export const deleteConnectionFromReqUserAndReturn =
  async (req: any, res: any): Promise<void> => {
    try {
      const user = await UserModel.findById(res.locals.userId);
      await user.deleteConnectionFromUser(req.params.targetId);
      return res.status(200).send([user.connections]);
    } catch (exception) {
      if (exception.message.includes("is not a connection") ||
      exception.message.includes("User id not found")) {
        return res.status(404).send({
          error: exception.message,
        });
      }
      return res.status(500).send({
        error: exception.message,
      });
    }
  };
