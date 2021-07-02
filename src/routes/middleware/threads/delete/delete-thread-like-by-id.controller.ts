import { UserModel } from "../../../../models/user/user.model";

export const deleteThreadLikeById = async (req: any, res: any): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    const result = await user.deleteLikeFromThread({ targetThreadId: req.params.id,
      targetLikeId: req.body.threadLikeId });
    return res.status(200).send(result);
  } catch (err) {
    res.status(500).send({ error: `Unable to delete thread like: ${err.message}` });
  }
};
