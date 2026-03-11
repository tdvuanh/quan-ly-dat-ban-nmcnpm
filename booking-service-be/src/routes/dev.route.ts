import { Router } from "express";
import { prisma } from "../lib/prisma"; // prisma đã export const prisma

const router = Router();

/**
 * DEV ONLY: tạo user demo để test FK
 * POST /api/dev/seed-user
 */
router.post("/seed-user", async (_req, res, next) => {
  try {
    // tùy schema bạn, sửa field cho khớp
    const user = await prisma.users.create({
      data: {
        full_name: "Test User",
        phone: "0123456789",
        email: `test${Date.now()}@gmail.com`,
        password_hash: "123456",
        role: "staff", // hoặc "client" tùy enum của bạn
      },
      select: { user_id: true, email: true, role: true },
    });

    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

export default router;
