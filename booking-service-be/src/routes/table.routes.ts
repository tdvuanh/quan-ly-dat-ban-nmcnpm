import { Router } from "express";
import { TableController } from "../controllers/index";

const tableRouter = Router();

tableRouter.get("/", TableController.getTables);
tableRouter.post("/", TableController.createTables);
tableRouter.get("/available", TableController.getTableReservationHours);
tableRouter.patch("/:tableId", TableController.updateTableStatus);
tableRouter.delete("/:tableId", TableController.deleteTable);

export default tableRouter;
