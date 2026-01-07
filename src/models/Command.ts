import { Schema, model, Document } from "mongoose";

export enum CommandType {
  PING = "PING",
  REBOOT = "REBOOT",
  COLLECT_LOGS = "COLLECT_LOGS",
}

export enum CommandStatus {
  PENDING = "PENDING",
  LEASED = "LEASED",
  SUCCEEDED = "SUCCEEDED",
  FAILED = "FAILED",
}

export interface ICommand extends Document {
  deviceId: string;
  type: CommandType;
  params?: any;
  status: CommandStatus;
  createdAt: Date;
  leasedAt?: Date;
  leaseExpiresAt?: Date;
  completedAt?: Date;
  output?: any;
  idempotencyKey?: string;
  expiresAt?: Date;
}

const CommandSchema = new Schema<ICommand>(
  {
    deviceId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(CommandType), required: true },
    params: { type: Schema.Types.Mixed },

    status: {
      type: String,
      enum: Object.values(CommandStatus),
      default: CommandStatus.PENDING,
      index: true,
    },

    leasedAt: Date,
    leaseExpiresAt: Date,
    completedAt: Date,
    output: Schema.Types.Mixed,
    idempotencyKey: {
      type: String,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },

  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

CommandSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);


export const Command = model<ICommand>("Command", CommandSchema);
