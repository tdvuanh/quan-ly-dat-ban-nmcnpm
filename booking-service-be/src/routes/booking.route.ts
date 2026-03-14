import { Router } from "express";
import { prisma } from "../lib/prisma";
import { format } from "date-fns";

const router = Router();

/**
 * POST /api/bookings
 */
router.post("/", async (req, res, next) => {
  try {
    const {
      user_id,
      table_id,
      table_code,
      area,
      guests,
      date,
      time,
      duration,
      deposit_amount,
      payment_method,
      customer_name,
      phone,
      notes,
    } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Missing date" });
    }

    const formattedDate = format(new Date(String(date)), "yyyy-MM-dd");

    if (!table_code || guests == null || !formattedDate || !time) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const booking = await prisma.bookings.create({
      data: {
        user_id: user_id ?? null,
        table_id: table_id ? BigInt(table_id) : null,
        table_code,
        area,
        guests: Number(guests),
        date: formattedDate,
        time,
        duration: duration != null ? Number(duration) : null,
        deposit_amount: deposit_amount != null ? Number(deposit_amount) : 0,
        payment_method,
        status: "confirmed",
        customer_name,
        phone,
        notes,
      },
    });
    await prisma.notifications.create({
      data: {
        user_id: null,
        title: "Đặt bàn mới",
        content: `Khách ${customer_name} - SĐT ${phone} đã đặt bàn ${table_code} lúc ${time} ngày ${formattedDate}`,
      },
    });
    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

/**
 * GET /api/bookings/:user_id  -> lịch sử đặt bàn theo user
 */
router.get("/:user_id", async (req, res, next) => {
  try {
    const { user_id } = req.params;

    const bookings = await prisma.bookings.findMany({
      where: {
        user_id: user_id, // 🔥 filter đúng user
        status: {
          not: "cancelled",
        },
      },
      orderBy: {
        date: "desc",
      },
      select: {
        id: true,
        table_id: true,
        table_code: true,
        area: true,
        guests: true,
        date: true,
        time: true,
        duration: true,
        deposit_amount: true,
        status: true,
      },
    });

    return res.json({ bookings });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/bookings/:id/serve -> đánh dấu đã phục vụ
router.patch("/:id/serve", async (req, res, next) => {
  try {
    const { id } = req.params; // ✅ string uuid
    if (!id) return res.status(400).json({ message: "Invalid id" });

    const booking = await prisma.bookings.update({
      where: { id }, // ✅ đúng theo model
      data: { status: "served" },
    });

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

// PATCH /api/bookings/:id/cancel  -> hủy booking
router.patch("/:id/cancel", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body as { cancelReason?: string };

    if (!id) return res.status(400).json({ message: "Invalid id" });
    if (!cancelReason?.trim()) {
      return res.status(400).json({ message: "Missing cancelReason" });
    }

    const booking = await prisma.bookings.update({
      where: { id },
      data: { status: "cancelled" },
    });

    return res.json({ booking });
  } catch (err) {
    return next(err);
  }
});

// GET /api/bookings/table/:table_id/available-hours?date=YYYY-MM-DD
router.get("/table/:table_id/available-hours", async (req, res, next) => {
  try {
    const { date } = req.query;
    const { table_id } = req.params;

    if (!table_id || table_id === "null") {
      return res.status(400).json({
        message: "Invalid table_id",
      });
    }

    const tableId = BigInt(table_id);
    if (!date) {
      return res.status(400).json({ message: "Missing date" });
    }

    const bookings = await prisma.bookings.findMany({
      where: {
        table_id: tableId,
        date: String(date),
        status: "confirmed",
      },
      select: {
        time: true,
      },
    });

    const bookedHours = bookings.map((b) => b.time.slice(0, 5));

    const operatingHours: string[] = [];

    for (let i = 10; i <= 22; i++) {
      operatingHours.push(`${i.toString().padStart(2, "0")}:00`);

      if (i < 22) {
        operatingHours.push(`${i.toString().padStart(2, "0")}:30`);
      }
    }

    const availableHours = operatingHours.filter((h) => !bookedHours.includes(h));

    return res.json({
      table_id,
      date,
      booked_hours: bookedHours,
      available_hours: availableHours,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/tables/available", async (req, res, next) => {
  try {
    const { date, time } = req.query;

    if (!date || !time) {
      return res.status(400).json({ message: "Missing date or time" });
    }

    // 1️⃣ lấy booking trùng giờ
    const bookings = await prisma.bookings.findMany({
      where: {
        date: String(date),
        time: String(time),
        status: "confirmed",
      },
      select: {
        table_id: true,
      },
    });

    // 2️⃣ lấy danh sách bàn đã bị đặt
    const bookedTableIds = bookings
      .map((b) => b.table_id)
      .filter((id): id is bigint => id !== null);

    // 3️⃣ lấy tất cả bàn trừ bàn đã bị đặt
    const tables = await prisma.tables.findMany({
      where: {
        table_id: {
          notIn: bookedTableIds,
        },
      },
    });

    res.json({ tables });
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Missing date" });
    }

    const bookings = await prisma.bookings.findMany({
      where: {
        date: String(date),
        status: {
          not: "cancelled",
        },
      },
      select: {
        table_id: true,
        time: true,
      },
    });

    return res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

router.patch("/table/:table_id/finish", async (req, res, next) => {
  try {
    const { table_id } = req.params;

    const booking = await prisma.bookings.findFirst({
      where: {
        table_id: BigInt(table_id),
        status: "confirmed",
      },
      orderBy: {
        date: "desc",
      },
    });

    if (!booking) {
      return res.json({ message: "No active booking" });
    }

    await prisma.bookings.update({
      where: { id: booking.id },
      data: {
        status: "served",
      },
    });

    res.json({ message: "Booking finished" });
  } catch (err) {
    next(err);
  }
});

//thông báo cho nhân viên về các booking mới
// thông báo cho admin
router.get("/notifications/all", async (req, res, next) => {
  try {
    const notifications = await prisma.notifications.findMany({
      where: {
        user_id: null, // chỉ lấy thông báo admin
      },
      orderBy: {
        created_at: "desc",
      },
      take: 20,
    });

    res.json({ notifications });
  } catch (err) {
    next(err);
  }
});
export default router;
