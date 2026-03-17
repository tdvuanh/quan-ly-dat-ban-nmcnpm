import { Router } from "express";
import walletController from "../controllers/wallet.controller";

const router = Router();

router.get("/users/:userId/wallet", walletController.getWallet);
router.post("/wallets/:walletId/transactions", walletController.createTransaction);

export default router;
