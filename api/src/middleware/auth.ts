import { Response, NextFunction } from "express";
import Request from "../types/Request";

export  function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.userId) {
    next();
  } else {
    res.sendStatus(401);
  }
}
