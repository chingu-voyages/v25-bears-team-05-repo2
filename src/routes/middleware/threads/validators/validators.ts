import { body, param } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";

export const threadIdValidator = (): any[] => {
  return [param("id").not().isEmpty().trim().escape()];
};

export const threadPostValidator = (): any[] => {
  return [body("htmlContent").not().isEmpty().trim(), // Unsure whether or not to escape here?
    body("threadType").isNumeric().not().isEmpty(),
    body("visibility").not().isEmpty().isInt(),
    body("hashTags").custom((value) => {
      if (!value) {
        return true;
      }
      return Array.isArray(value);
    }),
    body("attachments").custom((value) => {
      if (!value) {
        return true;
      }
      return Array.isArray(value);
    }),
    sanitizeBody("hashTags"),
    sanitizeBody("htmlContent"),
    sanitizeBody("attachments")];
};

export const threadsPatchValidatorSanitizer = (): any[] => {
  return [param("id").not().isEmpty().trim().escape(),
    body("threadType").trim().escape(),
    body("visibility").trim().escape(),
    sanitizeBody("hashTags").customSanitizer((value) => {
      return value.toLowerCase();
    }),
    sanitizeBody("htmlContent"),
    sanitizeBody("attachments"),
    body("threadType").custom((value) => {
      if (value) {
        if (Number.isInteger(value)) {
          return true;
        }
        return false;
      }
      return true;
    }),
    body("visibility").custom((value) => {
      if (value) {
        if (Number.isInteger(value)) {
          return true;
        }
        return false;
      }
      return true;
    }),
    body("attachments").custom((value) => {
      if (!value) {
        return true;
      }
      return Array.isArray(value);
    }),
  ];
};

export const threadsPostLikesValidator = (): any[] => {
  return [param("id").trim().escape(),
    body("title").exists().trim().escape(),
    param("id").custom((value) => {
      return !(value === "" || !value);
    }),
  ];
};

export const deleteThreadLikeValidator = (): any[] => {
  return [param("id").exists().trim().escape(),
    param("id").custom((value) => {
      return !(value === "" || !value);
    }),
    body("threadLikeId").exists().trim().escape()];
};
