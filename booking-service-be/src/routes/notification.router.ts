import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

/**
 * GET /api/notifications
 * Lấy danh sách thông báo
 */
router.get("/", async (req, res, next) => {
  try {
    const notifications = await prisma.notifications.findMany({
      orderBy: {
        created_at: "desc",
      },
    });

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notifications
 * Tạo thông báo
 */
router.post("/", async (req, res, next) => {
  try {
    const { user_id, title, content } = req.body;

    const notification = await prisma.notifications.create({
      data: {
        user_id: user_id ?? null,
        title,
        content,
      },
    });

    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/notifications/:id/read
 * Đánh dấu đã đọc
 */
router.patch("/:id/read", async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notifications.update({
      where: {
        notification_id: BigInt(id),
      },
      data: {
        is_read: true,
      },
    });

    res.json({ notification });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/notifications/:id
 */
router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.notifications.delete({
      where: {
        notification_id: BigInt(id),
      },
    });

    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
