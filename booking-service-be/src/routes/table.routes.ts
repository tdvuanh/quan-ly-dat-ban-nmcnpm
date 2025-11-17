import { Router } from "express";
import { TableController } from "../controllers/index";

const router = Router();

router.get("/", TableController.getTables);

router.post("/", TableController.createTables);

router.patch("/:tableId", TableController.updateTableStatus);

router.delete("/:tableId", TableController.deleteTable);

export default router;
