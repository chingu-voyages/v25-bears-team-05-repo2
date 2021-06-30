import { UserModel } from "../../../../models/user/user.model";
import { getReqUser } from "../../../utils";

export const getUserConnectionsById =
  async (req: any, res: any, next: any): Promise<void> => {
    const userId = getReqUser(req);
    if (!userId) return res.status(500).send({ error: "Unable to get req.user.id " });

    if (req.params.id === "me") {
      try {
        const user = await UserModel.findById(userId);
        return res.status(200).send(user.connections);
      } catch (exception) {
        return res.status(404).send({ error: `Unable to get user by id ${userId}` });
      }
    } else {
      // some other user
      try {
        const otherUser = await UserModel.findById(req.params.id);
        if (otherUser) {
          return res.status(200).send(otherUser.connections);
        } else {
          return res.status(404).send({
            errors: `id ${req.params.id} not found`,
          });
        }
      } catch (err) {
        return res.status(500).send({
          error: err.message,
        });
      }
    }
  };
