import { Request, Response, NextFunction } from "express";


export function routeProtector(req: Request, res: Response, next: NextFunction) {
  if (req.user) {
    next();
  } else {
    res.status(401).send({message: "This route is protected."}); // Send to the login page
  }
}
