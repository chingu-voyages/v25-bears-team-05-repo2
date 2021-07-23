import { NextFunction, Request, Response } from "express";

export function passwordsMatch(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.body.first_password !== req.body.second_password) {
    res.statusMessage = "Passwords don't match";
    res.status(400).end();
  }
  next();
}
