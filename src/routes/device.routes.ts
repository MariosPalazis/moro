import { Router } from "express";
import {
  pollNextCommand,
  reportCommandResult,
} from "../controllers/device.controller";
import { validate } from "../utils/validate";
import { completionValidator, pollValidator } from "../validators/device.validator";

const router = Router();

router.post(
  "/devices/:deviceId/commands/poll",
  pollValidator,
  validate,
  pollNextCommand
);

router.post(
  "/commands/:commandId/complete",
  completionValidator,
  validate,
  reportCommandResult
);

export default router;
