import { Request, Response, NextFunction } from "express";

export const doesPasswordMeetLengthRequirements = (password: string) => {
  return password && password.length > 7;
};
export const doesPasswordHaveMixedCase = (password: string) => {
  // Password must have at least 1 lower case letter and 1 uppercase letter
  const lowerCaseExpression = /[a-z]/;
  const upperCaseExpression = /[A-Z]/;
  return lowerCaseExpression.test(password) && upperCaseExpression.test(password);

};

export const isPasswordValid = (password: string) => {
  return doesPasswordMeetLengthRequirements(password) && doesPasswordHaveMixedCase(password);
};

export function validatePassword (req: Request, res: Response, next: NextFunction) {
  if (isPasswordValid(req.body.password)) {
    next();
    return;
  }
  res.status(400).send({ errors: [ { location: "body",
  message: "Ensure password is at least 8 characters in length and contains at least 1 uppercase and 1 lowercase character",
  param: "password" }]});
}
