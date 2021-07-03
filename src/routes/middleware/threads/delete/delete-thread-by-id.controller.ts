import { UserModel } from "../../../../models/user/user.model";

export const deleteThreadById = async (req: any, res: any): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    const result = await user.deleteThread({ targetThreadId: req.params.thread_id });
    return res.status(200).send(result);
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};
