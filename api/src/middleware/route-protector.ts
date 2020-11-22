import { Request, Response, NextFunction } from "express";


export function routeProtector(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401).send({message: "Not authorized: This route is protected."}); // Send to the login page
  }
}
