// import { createError } from "../utils/errors";
import express from "express";
const router = express.Router();

router.post("/", (req:any, res:any) => {
  console.log(req.body)
  res.status(200).json({ response: "ok" })
});

export default router;
