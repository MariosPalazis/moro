import express from "express";
import commandRoutes from "./routes/command.routes";
import deviceRoutes from "./routes/device.routes";


export const app = express();

/**
 * Middleware
 */
app.use(express.json());

/**
 * Routes
 */
app.use(commandRoutes);
app.use(deviceRoutes);

/**
 * Health check
 */
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});

export default app;