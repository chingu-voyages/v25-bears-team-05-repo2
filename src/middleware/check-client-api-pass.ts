import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/errors";

export default function checkClientApiPass(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // bypass check if google auth route
  if (req.path.match(/^\/auth|^\/success|^\/fail|^\/api\/auth\|/)) {
    next();
  } else {
    const authHeader = req.headers.authorization;
    const auth =
      authHeader &&
      Buffer.from(authHeader.split(/\s+/).pop(), "base64").toString();
    if (auth && auth === process.env.CLIENT_API_PASS) {
      next();
    } else {
      res.status(401).send({
        errors: [
          {
            ...createError(
              "route authorization",
              "unauthorized: invalid client api passphrase",
              "na"
            ),
          },
        ],
      });
    }
  }
}
