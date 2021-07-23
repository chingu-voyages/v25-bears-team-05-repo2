import { getReqUser } from "../utils";

export const getUserContext = (req: any, res: any, next: any): void => {
  const userId = getReqUser(req);
  if (!userId) return res.status(500).send({ error: "Unable to get req.user.id " });
  res.locals.userId = userId;
  next();
};
