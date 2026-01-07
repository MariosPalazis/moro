import { body, param } from "express-validator";

export const pollValidator = [
  param("deviceId").isString().notEmpty(),
];

export const completionValidator = [
  param("commandId").isMongoId(),

  body("status")
    .isIn(["SUCCEEDED", "FAILED"])
    .withMessage("Invalid completion status"),

  body("output").optional(),
];
