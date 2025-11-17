import { ENV } from "./config/env";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { TableRoutes, ReservationRoutes } from "./routes/index";
import { errorHandler } from "./middlewares/error.middleware";

import "./config/serialization";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

console.log(ENV.API_URI_PREFIX);

app.use(`/${ENV.API_URI_PREFIX}/tables`, TableRoutes);
app.use(`/${ENV.API_URI_PREFIX}/reservations`, ReservationRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

// error handler
app.use(errorHandler);

export default app;
