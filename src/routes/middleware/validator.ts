import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator/check";

export const validate = (req: Request, res: Response, next: NextFunction): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
};
