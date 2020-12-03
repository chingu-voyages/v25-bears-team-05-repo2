import * as express from "express";
import { Response } from "express";
import { getProfileById } from "../db/utils/get-profile-by-id";
import { routeProtector } from "../middleware/route-protector";
import { body, param, validationResult } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { UserModel } from "../models/user/user.model";
import { createError } from "../utils/errors";
import { IProfileData } from "../models/user/user.types";
import { decrypt } from "../utils/crypto";
import { getVisibleThreads } from "../db/utils/get-visible-threads";
const router = express.Router();

router.get("/", routeProtector, (req: any, res: Response) => {

});

export default router;
