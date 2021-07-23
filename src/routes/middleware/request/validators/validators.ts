import { param, body } from "express-validator/check";

export const createConnectionRequestValidationRules = (): any[] => {
  return [param("id").not().isEmpty().trim().escape()];
};

export const deleteConnectionRequestValidationRules = (): any[] => {
  return [param("id").not().isEmpty().trim().escape(),
    body("origin").not().isEmpty().trim().escape()];
};
