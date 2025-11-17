import { Router } from "express";
import { ReservationController } from "../controllers/index";

const router = Router();

router.get("/", ReservationController.getAll);
router.get("/:id", ReservationController.getById);
router.post("/", ReservationController.create);
router.put("/:id", ReservationController.update);
router.patch("/:id", ReservationController.patch);
router.delete("/:id", ReservationController.delete);
router.patch("/:id/status", ReservationController.updateStatus);

export default router;
