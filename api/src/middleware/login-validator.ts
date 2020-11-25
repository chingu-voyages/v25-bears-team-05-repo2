import { Request, Response, NextFunction } from "express";

// Checks if user already has a session
export function checkNotAuthenticated (req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    next();
  } else {
    res.send(`<script>window.close()</script>`);
  }
}
