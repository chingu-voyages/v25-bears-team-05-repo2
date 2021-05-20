import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator/check";

export function handleChainValidationResult(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
  } else {
    res.status(400).send({ errors: errors.array() });
  }
}
