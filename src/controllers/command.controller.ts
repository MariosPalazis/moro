import { Request, Response } from "express";
import { Command, CommandStatus } from "../models/Command";
import { logError } from "../utils/errorLogger";
import { COMMAND_TTL_MS } from "../configs/expirations";

export const scheduleCommand = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const { type, params } = req.body;
    const idempotencyKey = req.header("Idempotency-Key");

    if (idempotencyKey) {
      const existing = await Command.findOne({
        deviceId,
        idempotencyKey,
      });

      if (existing) {
        return res.status(200).json({
          commandId: existing._id,
          deviceId: existing.deviceId,
          type: existing.type,
          params: existing.params,
          status: existing.status,
          createdAt: existing.createdAt,
        });
      }
    }

    const now = Date.now();

    const command = await Command.create({
      deviceId,
      type,
      params,
      idempotencyKey,
      expiresAt: new Date(now + COMMAND_TTL_MS),
      status: CommandStatus.PENDING,
    });

    res.status(201).json({
      commandId: command._id,
      deviceId: command.deviceId,
      type: command.type,
      params: command.params,
      status: command.status,
      createdAt: command.createdAt,
    });
  } catch (err: any) {
    await logError(err, req, 500);
    res.status(500).json({ error: "Internal server error" });
  }
};
