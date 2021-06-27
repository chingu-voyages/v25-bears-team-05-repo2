import { UserModel } from "../../../../models/user/user.model";
import { IProfileData } from "../../../../models/user/user.types";
import { decrypt } from "../../../../utils/crypto";
import { getReqUser } from "../../../utils";

export const validateReqParamsIdIsMeOrReqUser = (req: any,
  res: any,
  next: any): void => {
  const userId = getReqUser(req);
  if (!userId) return res.status(400).send({ error: "Cannot determine req.user.id" });
  res.locals.userId = userId;
  if (req.params.id !== "me" && req.params.id !== userId) {
    return res.status(400).send({
      errors: [
        {
          "location": "/users",
          "msg": `Id must be 'me' or requesting user id`,
          "param": "id",
        },
      ],
    });
  }
  next();
};

export const updateUserProfile = async (req: any, res: any): Promise<void> => {
  const profileUpdateRequest: IProfileData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    jobTitle: req.body.jobTitle,
    avatarUrl: req.body.avatar,
  };
  try {
    const user = await UserModel.findById(res.locals.userId);
    await user.updateUserProfile(profileUpdateRequest);
    return res.status(200).send({
      firstName: user.firstName,
      lastName: user.lastName,
      jobTitle: user.jobTitle,
      avatar: req.body.avatar,
      email: decrypt(user.auth.email),
    });
  } catch (exception) {
    return res.status(500).send({
      error: exception.message,
    });
  }
};
