import { body, param } from "express-validator/check";

export const getUserValidationRules = (): any[] => {
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
