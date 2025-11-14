import { Router } from "express";
import {
  createTables,
  deleteTable,
  getTables,
  updateTableStatus,
} from "../controllers/tables.controller";

const router = Router();

router.get("/", getTables);

router.post("/", createTables);

router.patch("/:tableId", updateTableStatus);

router.delete("/:tableId", deleteTable);

export default router;
