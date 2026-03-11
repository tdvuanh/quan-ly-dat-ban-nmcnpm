// src/routes/index.ts
import { Router } from "express";
import TableRoutes from "./table.routes";
import ReservationRoutes from "./reservations.routes";
import WalletRoutes from "./wallet.route";
import DevRoutes from "./dev.route";
import bookingRouter from "./booking.route";

const router = Router();

router.use("/tables", TableRoutes);
router.use("/reservations", ReservationRoutes);
router.use("/wallet", WalletRoutes);
router.use("/bookings", bookingRouter);
router.use("/dev", DevRoutes);

export default router;
