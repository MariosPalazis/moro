import { body, param } from "express-validator";
import { CommandType } from "../models/Command";

export const scheduleCommandValidator = [
  param("deviceId").isString().notEmpty(),

  body("type")
    .isIn(Object.values(CommandType))
    .withMessage("Invalid command type"),

  body("params").optional().isObject(),

  body("ttlSeconds").optional().isInt({ min: 1 }),
];
