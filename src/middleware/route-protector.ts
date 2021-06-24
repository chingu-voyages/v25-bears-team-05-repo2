/* eslint-disable require-jsdoc */
require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/errors";


export function routeProtector(req: Request, res: Response, next: NextFunction) {
  if (process.env.NODE_ENV && process.env.NODE_ENV.match("test")) {
    next();
    return;
  }
  if (req.user) {
    next();
  } else {
    res.status(401).send({ errors:
      [{ ...createError("route authorization", "unauthorized: protected route",
        "na") }] }); // Send to the login page
  }
}
