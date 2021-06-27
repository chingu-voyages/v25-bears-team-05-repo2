import { getProfileById } from "../../../../db/utils/get-profile-by-id/get-profile-by-id";
import { getReqUser } from "../../../utils";

export const getUserById = async (req: any, res: any, next: any): Promise<void> => {
  const userId = getReqUser(req);

  if (!userId) return res.status(400).send("Cannot determine req.user.id");

  try {
    if (req.params.id === "me") {
      const homeProfileData = await getProfileById(userId);
      return res.status(200).send(homeProfileData);
    } else {
      const otherUserData = await getProfileById(req.params.id);
      return res.status(200).send(otherUserData);
    }
  } catch (err) {
    if (err.message === "Unable to find profile for id") {
      return res.status(404).send({
        errors: [
          {
            "location": "/users",
            "msg": `invalid id ${req.params.id} ${err.message}`,
            "param": "id",
          },
        ],
      });
    }
    return res.status(500).send({
      errors: [
        {
          "location": "/users",
          "msg": `${err.message}`,
          "param": "unknown",
        },
      ],
    });
  }
};
