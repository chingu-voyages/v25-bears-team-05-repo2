import { Request, Response, NextFunction } from "express";


export function routeProtector(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401); // Send to the login page
  }
}
