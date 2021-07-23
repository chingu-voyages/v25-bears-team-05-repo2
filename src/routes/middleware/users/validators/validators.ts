import { body, param } from "express-validator/check";
import { sanitizeBody } from "express-validator/filter";
import { isURLValid } from "../../../../utils/url-validation";

export const userValidationRules = (): any[] => {
  return [param("id").not().isEmpty().trim().escape()];
};

export const putUserConnectionsValidationRules = (): any[] => {
  return [
    param("id").not().isEmpty().trim().escape(),
    body("connectionRequestDocumentId").not().isEmpty().trim().escape(),
  ];
};

export const deleteConnectionValidationRules = (): any[] => {
  return [param("targetId").not().isEmpty().trim().escape()];
};

export const patchUserValidationRules = (): any[] => {
  return [
    body("firstName").trim().escape(),
    body("lastName").trim().escape(),
    body("avatar").custom((value) => {
      if (value) {
        try {
          return isURLValid(value);
        } catch (err) {
          return false;
        }
      } else {
        return true;
      }
    }),
    sanitizeBody("avatar").customSanitizer((value) => {
      return value.trim();
    }),
    body("jobTitle").trim().escape(),
    param("id").not().isEmpty().trim().escape(),
  ];
};

export const patchNotificationsValidationRules = (): any[] => {
  return [
    param("notificationId").not().isEmpty().trim().escape(),
    body("read").not().isEmpty().isBoolean(),
  ];
};

export const deleteNotificationValidationRules = (): any[] => {
  return [param("notificationId").not().isEmpty().trim().escape()];
};
