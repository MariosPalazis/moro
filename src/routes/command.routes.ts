import { Router } from "express";
import { scheduleCommand } from "../controllers/command.controller";
import { validate } from "../utils/validate";
import { scheduleCommandValidator } from "../validators/command.validator";

const router = Router();

router.post(
  "/devices/:deviceId/commands",
  scheduleCommandValidator,
  validate,
  scheduleCommand
);

export default router;
