/* eslint-disable require-jsdoc */
require("dotenv").config;
import * as express from "express";
import { routeProtector } from "../../middleware/route-protector";

import { createConnectionRequest,
  dispatchNotification,
  generateNotification,
  getCreateRequestRequestorApprover,
  refreshAndSendFinalResponseToRequestor }
  from "../middleware/request/create";

import {
  createConnectionRequestValidationRules,
  deleteConnectionRequestValidationRules,
}
  from "../middleware/request/validators/validators";
import { deleteRequest, getDeleteRequestorApprover } from "../middleware/request/delete";
import { validate } from "../middleware/validator";

const router = express.Router();

router.post(
  "/connection/:id",
  routeProtector,
  createConnectionRequestValidationRules(),
  validate,
  getCreateRequestRequestorApprover,
  createConnectionRequest,
  generateNotification,
  dispatchNotification,
  refreshAndSendFinalResponseToRequestor,
);

router.delete(
  "/connection/:id",
  routeProtector,
  deleteConnectionRequestValidationRules(),
  validate,
  getDeleteRequestorApprover,
  deleteRequest,
);

export default router;
