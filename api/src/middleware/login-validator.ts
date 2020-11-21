import { Request, Response, NextFunction } from "express";

// Checks if user already has a session
export function checkNotAuthenticated (req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    next();
  } else {
    // Redirect to a profile page as user is already logged in
    res.status(400).send({ message: "There is already a session. You need to log out."}); // Placeholder
  }
}
