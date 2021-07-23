import { UserModel } from "../../../../models/user/user.model";

export const addThreadLike = async (req: any, res: any): Promise<void> => {
  try {
    const user = await UserModel.findById(res.locals.userId);
    const result = await user.addLikeToThread({ targetThreadId: req.params.id,
      title: req.body.title });
    return res.status(200).send(result);
  } catch (err) {
    return res.status(500)
      .send({ error: `Unable to add like to thread: ${err.message}` });
  }
};
