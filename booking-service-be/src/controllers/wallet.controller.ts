import { Request, Response } from "express";
import walletService from "../service/wallet.service";

class WalletController {
  // GET /users/:userId/wallet
  async getWallet(req: Request, res: Response) {
    try {
      const userId = req.params.userId;

      const wallet = await walletService.getWalletByUserId(userId);

      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }

      return res.json({
        ...wallet,
        wallet_id: wallet.wallet_id.toString(),
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  // POST /wallets/:walletId/transactions
  async createTransaction(req: Request, res: Response) {
    try {
      const walletId = BigInt(req.params.walletId);
      const { type, amount, reservation_id } = req.body;

      const result = await walletService.createTransaction({
        walletId,
        type,
        amount,
        reservation_id,
      });

      return res.json(result);
    } catch (error: any) {
      console.error(error);
      return res.status(400).json({
        message: error.message || "Transaction failed",
      });
    }
  }
}

export default new WalletController();
