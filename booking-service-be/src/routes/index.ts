// src/routes/index.ts
import { Router } from "express";
import TableRoutes from "./table.routes";
import ReservationRoutes from "./reservations.routes";
import WalletRoutes from "./wallet.routes";
import UserRouter from "./user.routes";
import CustomerRouter from "./customer.routes";

const router = Router();

router.use("/tables", TableRoutes);
router.use("/reservations", ReservationRoutes);
router.use("/wallet", WalletRoutes);
router.use("/users", UserRouter);
router.use("/customers", CustomerRouter);

export default router;
