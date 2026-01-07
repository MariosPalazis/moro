import { ErrorLog } from "../models/ErrorLog";
import { Request } from "express";

export const logError = async (
  err: any,
  req: Request,
  statusCode?: number
) => {
  try {
    await ErrorLog.create({
      message: err.message || "Unknown error",
      stack: err.stack,
      route: req.originalUrl,
      method: req.method,
      statusCode,
      payload: {
        params: req.params,
        body: req.body,
        query: req.query,
      },
    });
  } catch (loggingError) {
    console.error("Failed to write error log:", loggingError);
  }
};
