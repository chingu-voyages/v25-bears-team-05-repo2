import { Request, Response, NextFunction } from "express";
import { createError } from "../utils/errors";

// Checks if user already has a session
export function checkNotAuthenticated (req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    next();
  } else {
    // Redirect to a profile page as user is already logged in
    res.status(400).send({ errors: [ {
      ...createError("log-out request", "There is already a session. You need to log out.", "na")
    }]});
  }
}
