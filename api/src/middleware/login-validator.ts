import { Request, Response, NextFunction } from "express";

// Checks if user already has a session
export function logoutIfAuthenticated (req: Request, res: Response, next: NextFunction) {
  req.user && req.logOut();
  next();
}
