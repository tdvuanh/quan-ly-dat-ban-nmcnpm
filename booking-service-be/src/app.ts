import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index";
import tableRoutes from "./routes/table.routes";
import { errorHandler } from "./middlewares/error.middleware";

import "./config/serialization";

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

app.use("/api", routes);
app.use("/api/tables", tableRoutes);

// 404
app.use((_req, res) => res.status(404).json({ message: "Not Found" }));

// error handler
app.use(errorHandler);

export default app;
