import prisma from "../config/prisma";

type TransactionInput = {
  walletId: bigint;
  type: "topup" | "deposit_payment";
  amount: number;
  reservation_id?: number;
};

class WalletService {
  async getWalletByUserId(userId: string) {
    return prisma.wallets.findFirst({
      where: { user_id: userId },
    });
  }

  async createTransaction(input: TransactionInput) {
    const { walletId, type, amount, reservation_id } = input;

    return prisma.$transaction(async (tx: any) => {
      const wallet = await tx.wallets.findUnique({
        where: { wallet_id: walletId },
      });

      if (!wallet) {
        throw new Error("Wallet not found");
      }

      let newBalance = wallet.balance;

      // 👉 logic nghiệp vụ
      if (type === "topup") {
        newBalance = wallet.balance + amount;
      }

      if (type === "deposit_payment") {
        if (wallet.balance < amount) {
          throw new Error("Insufficient balance");
        }
        newBalance = wallet.balance - amount;
      }

      // 👉 update balance
      await tx.wallets.update({
        where: { wallet_id: walletId },
        data: { balance: newBalance },
      });

      // 👉 log transaction
      const transaction = await tx.wallet_transactions.create({
        data: {
          wallet_id: walletId,
          type,
          amount,
          reservation_id,
        },
      });

      return transaction;
    });
  }
}

export default new WalletService();
