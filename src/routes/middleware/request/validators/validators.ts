import { NextFunction, Request, Response } from "express";
import { param, validationResult, body } from "express-validator/check";

export const validate = (req: Request, res: Response, next: NextFunction): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
};

export const createConnectionRequestValidationRules = (): any[] => {
  return [param("id").not().isEmpty().trim().escape()];
};

export const deleteConnectionRequestValidationRules = (): any[] => {
  return [param("id").not().isEmpty().trim().escape(),
    body("origin").not().isEmpty().trim().escape()];
};
