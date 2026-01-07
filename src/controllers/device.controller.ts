import { Request, Response } from "express";
import { Command, CommandStatus } from "../models/Command";
import { logError } from "../utils/errorLogger";
import { LEASE_DURATION_MS } from "../configs/expirations";



export const pollNextCommand = async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.params;
    const now = new Date();

    const command = await Command.findOneAndUpdate(
  {
    deviceId,
    $and: [
      {
        $or: [
          { status: CommandStatus.PENDING },
          {
            status: CommandStatus.LEASED,
            leaseExpiresAt: { $lte: now },
          },
        ],
      },
      {
        $or: [
          { expiresAt: { $exists: false } },
          { expiresAt: { $gt: now } },
        ],
      },
    ],
  },
  {
    status: CommandStatus.LEASED,
    leasedAt: now,
    leaseExpiresAt: new Date(now.getTime() + LEASE_DURATION_MS),
  },
  {
    sort: { createdAt: 1 },
    new: true,
  }
);


    if (!command) {
      return res.sendStatus(204);
    }

    res.json({
      commandId: command._id,
      deviceId: command.deviceId,
      type: command.type,
      params: command.params,
      status: command.status,
      leasedAt: command.leasedAt,
      leaseExpiresAt: command.leaseExpiresAt,
    });
  } catch (err: any) {
    await logError(err, req, 500);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const reportCommandResult = async (req: Request, res: Response) => {
  try {
    const { commandId } = req.params;
    const { status, output } = req.body;
    const now = new Date();

    const command = await Command.findOne({
      _id: commandId,
      status: CommandStatus.LEASED,
      leaseExpiresAt: { $gt: now },
    });

    if (!command) {
      return res.status(409).json({
        error: "Command not leased or lease expired",
      });
    }

    command.status = status;
    command.completedAt = now;
    command.output = output;

    await command.save();

    res.json({
      commandId: command._id,
      status: command.status,
      completedAt: command.completedAt,
    });
  } catch (err: any) {
    await logError(err, req, 500);
    res.status(500).json({ error: "Internal server error" });
  }
};
