import { Router } from "express";
import customersController from "../controllers/customers.controller";

const customerRouter = Router();

customerRouter.get("/", customersController.getCustomers);
customerRouter.get("/:id", customersController.getCustomerById);
customerRouter.get("/phone/:phone", customersController.getCustomerByPhone);
customerRouter.post("/", customersController.createCustomer);
customerRouter.post("/guest-login", customersController.guestLogin);
customerRouter.post("/upsert", customersController.upsertCustomer);
customerRouter.patch("/:id", customersController.updateCustomer);
customerRouter.delete("/:id", customersController.deleteCustomer);

export default customerRouter;
