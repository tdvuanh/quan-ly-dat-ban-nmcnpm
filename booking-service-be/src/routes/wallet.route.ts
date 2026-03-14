import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * DEMO topup
 * POST /wallet/topup
 * body: { user_id: string(uuid), amount: number }
 */
router.post("/topup", async (req, res, next) => {
  try {
    const { user_id, amount } = req.body as { user_id?: string; amount?: number };

    if (!user_id || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid user_id or amount" });
    }

    const wallet = await prisma.wallets.upsert({
      where: { user_id },
      update: { balance: { increment: amount } },
      create: { user_id, balance: amount },
    });
    await prisma.notifications.create({
      data: {
        user_id,
        title: "Nạp tiền thành công",
        content: `Bạn đã nạp ${amount.toLocaleString()}đ vào ví`,
      },
    });
    return res.json({ wallet });
  } catch (err) {
    return next(err);
  }
});

// GET /api/wallet/:user_id
router.get("/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const wallet = await prisma.wallets.findUnique({
      where: { user_id },
    });

    if (!wallet) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    return res.json({ wallet });
  } catch (err) {
    return next(err);
  }
});

// Post /api/wallet/pay-deposit
router.post("/pay-deposit", async (req, res, next) => {
  try {
    const { user_id, amount, booking_id } = req.body;

    if (!user_id || !booking_id || typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1️⃣ lấy ví
      const wallet = await tx.wallets.findUnique({ where: { user_id } });

      if (!wallet) {
        return { ok: false as const, status: 404, message: "Wallet not found" };
      }

      if (Number(wallet.balance) < amount) {
        return { ok: false as const, status: 400, message: "Insufficient balance" };
      }

      // 2️⃣ lấy booking
      const booking = await tx.bookings.findUnique({
        where: { id: booking_id },
      });

      if (!booking) {
        return { ok: false as const, status: 404, message: "Booking not found" };
      }

      // 3️⃣ trừ tiền
      await tx.wallets.update({
        where: { user_id },
        data: {
          balance: { decrement: amount },
        },
      });

      // 4️⃣ xác nhận booking
      await tx.bookings.update({
        where: { id: booking_id },
        data: {
          status: "confirmed",
        },
      });
      await tx.notifications.create({
        data: {
          user_id,
          title: "Thanh toán thành công",
          content: `Bạn đã thanh toán ${amount.toLocaleString()}đ tiền đặt cọc`,
        },
      });

      // 5️⃣ khóa bàn
      await tx.tables.update({
        where: { table_id: BigInt(booking.table_id!) },
        data: { status: "reserved" },
      });

      return { ok: true as const, status: 200 };
    });

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    return res.json({ message: "Payment success" });
  } catch (err) {
    return next(err);
  }
});

export default router;
