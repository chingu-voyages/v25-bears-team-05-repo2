import { Request, Response, NextFunction } from "express";

const isPasswordTooShort = (password: string) => {
  return password.length < 8;
};
const doesPasswordHaveMixedCase = (password: string) => {
  return !password.match(/[A-Z]/) || !password.match(/[a-z]/);
};

const isPasswordValid = (password: string) => {
  return !isPasswordTooShort(password) && doesPasswordHaveMixedCase(password);
};

// export { isPasswordTooShort, doesPasswordHaveMixedCase, isPasswordValid };

export function validatePassword (req: Request, res: Response, next: NextFunction) {
  if (isPasswordValid(req.body.password)) next();
  res.send(400).json({ errors: [ { location: "body", message: "Password does not meet security requirements", param: "password" }]});
}
