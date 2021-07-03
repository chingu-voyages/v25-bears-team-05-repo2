import { getVisibleThreads }
  from "../../../../db/utils/get-visible-threads/get-visible-threads";
import { UserModel } from "../../../../models/user/user.model";

export const returnThreadsForParamIdMe = async (req: any,
  res: any,
  next: any): Promise<void> => {
  if (req.params.id === "me") {
    try {
      const user = await UserModel.findById(res.locals.userId);
      return res
        .status(200)
        .send({ id: res.locals.userId, threads: user.threads });
    } catch (exception) {
      return res.status(404).send({
        error: `User with id ${res.locals.userId} not found`,
      });
    }
  }
  next();
};

export const returnThreadsForUserByParamId = async (req: any,
  res: any): Promise<void> => {
  try {
    const targetUser = await UserModel.findById(req.params.id);
    if (targetUser) {
      // If user is a connection, return all threads
      // If not a connection, only return threads with an "anyone" visibility
      if (targetUser.connections[res.locals.userId] !== undefined) {
        return res.status(200).send({
          id: targetUser.id.toString(),
          threads: targetUser.threads,
        });
      } else {
        const onlyVisibleThreads = getVisibleThreads(targetUser.threads);
        return res.status(200).send({
          id: targetUser.id.toString(),
          threads: onlyVisibleThreads,
        });
      }
    } else {
      return res.status(404).send({
        error: `User with id ${req.params.id} not found`,
      });
    }
  } catch (err) {
    return res.status(500).send({
      errors: [
        {
          "location": "GET /users/:id/threads",
          "msg": `${err.message}`,
          "param": "id",
        },
      ],
    });
  }
};
