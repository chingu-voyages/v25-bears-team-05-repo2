import { Request, Response, NextFunction } from "express";

export function checkNotAuthenticated (req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    next();
  } else {
    // Redirect to a profile page as user is already logged in
    res.redirect("/"); // Placeholder
  }
}