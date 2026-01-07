import { Schema, model, Document } from "mongoose";

export interface IErrorLog extends Document {
  message: string;
  stack?: string;
  route: string;
  method: string;
  statusCode?: number;
  payload?: any;
  createdAt: Date;
}

const ErrorLogSchema = new Schema<IErrorLog>(
  {
    message: { type: String, required: true },
    stack: String,
    route: String,
    method: String,
    statusCode: Number,
    payload: Schema.Types.Mixed,
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const ErrorLog = model<IErrorLog>("ErrorLog", ErrorLogSchema);
