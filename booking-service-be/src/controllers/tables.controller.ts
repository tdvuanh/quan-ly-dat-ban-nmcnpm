import prismaClient from "../config/prisma";
import { Request, Response } from "express";
import { startOfDay, addDays, parseISO, isValid, parse } from "date-fns";

class TableController {
  getTables = async (req: Request, res: Response) => {
    try {
      const { date, time, duration } = req.query;

      let requestedCheckin: Date | null = null;
      let requestedCheckout: Date | null = null;

      if (date && time) {
        const parsed = parse(`${date} ${time}`, "yyyy-MM-dd HH:mm", new Date());

        if (!isValid(parsed)) {
          return res.status(400).json({ message: "Invalid date/time format" });
        }

        requestedCheckin = parsed;

        const durationMs = (Number(duration) || 120) * 60 * 1000; // default 120 phút

        requestedCheckout = new Date(parsed.getTime() + durationMs);
      }

      const tables = await prismaClient.tables.findMany({
        where:
          requestedCheckin && requestedCheckout
            ? {
                NOT: {
                  reservation_tables: {
                    some: {
                      reservations: {
                        status: {
                          in: ["pending", "confirmed"],
                        },
                        checkin_time: {
                          lt: requestedCheckout,
                        },
                        OR: [
                          {
                            checkout_time: {
                              gt: requestedCheckin,
                            },
                          },
                          {
                            checkout_time: null,
                          },
                        ],
                      },
                    },
                  },
                },
              }
            : undefined,

        orderBy: {
          table_id: "asc",
        },
      });

      const serialized = tables.map((t) => ({
        ...t,
        table_id: t.table_id.toString(),
      }));

      return res.json({
        tables: serialized,
      });
    } catch (error) {
      console.error("Error fetching tables:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  async getAvailableTables(req: Request, res: Response) {
    try {
      const { date, time, duration } = req.query;

      if (!date || !time) {
        return res.status(400).json({ message: "Missing date or time" });
      }

      const parsedDate = parseISO(date as string);
      if (!isValid(parsedDate)) {
        return res.status(400).json({ message: "Invalid date" });
      }

      // 👉 build start time
      const [hour, minute] = (time as string).split(":").map(Number);

      const start = new Date(parsedDate);
      start.setHours(hour, minute, 0, 0);

      // 👉 build end time
      const durationHours = Number(duration || 1);
      const end = new Date(start);
      end.setHours(start.getHours() + durationHours);

      // 🔥 QUERY CỐT LÕI
      const tables = await prismaClient.tables.findMany({
        where: {
          // 👉 KHÔNG có reservation bị overlap
          reservation_tables: {
            none: {
              reservations: {
                AND: [
                  {
                    checkin_time: {
                      lt: end,
                    },
                  },
                  {
                    checkout_time: {
                      gt: start,
                    },
                  },
                ],
              },
            },
          },
        },
      });

      return res.json(tables);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  getTableReservationHours = async (_req: Request, res: Response) => {
    try {
      const tableId = BigInt(_req.params.tableId);
      const { date } = _req.query;

      if (!date) {
        return res.status(400).json({ message: "date is required" });
      }

      const parsedDate = parseISO(date as string);

      if (!isValid(parsedDate)) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const start = startOfDay(parsedDate);
      const end = addDays(start, 1);

      const reservations = await prismaClient.reservation_tables.findMany({
        where: {
          table_id: tableId,
          reservations: {
            checkin_time: {
              lt: end,
            },
            checkout_time: {
              gt: start,
            },
          },
        },
        include: {
          reservations: {
            select: {
              reservation_id: true,
              checkin_time: true,
              checkout_time: true,
              status: true,
            },
          },
        },
      });

      const bookedSlots = reservations.map((r) => ({
        reservation_id: r.reservations?.reservation_id.toString(),
        checkin_time: r.reservations?.checkin_time,
        checkout_time: r.reservations?.checkout_time,
        status: r.reservations?.status,
      }));

      return res.json(bookedSlots);
    } catch (error) {
      console.error("Error fetching tables:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  createTables = async (_req: Request, res: Response) => {
    try {
      const { tableName, capacity } = _req.body;

      if (!tableName || typeof tableName !== "string") {
        return res.status(400).json({ message: "Số bàn (tableName) không hợp lệ" });
      }

      if (!capacity || typeof capacity !== "number") {
        return res.status(400).json({ message: "Sức chứa (capacity) phải là số" });
      }

      const newTable = await prismaClient.tables.create({
        data: {
          name: tableName,
          capacity,
          status: "available",
        },
      });

      const serialized = {
        ...newTable,
        table_id: newTable.table_id.toString(),
      };

      return res.status(201).json({
        message: "Thêm bàn mới thành công",
        data: serialized,
      });
    } catch (error) {
      console.error("Error creating table:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  updateTableStatus = async (req: Request, res: Response) => {
    try {
      const { tableId } = req.params;
      const { status } = req.body;

      const idNum = Number(tableId);
      if (!tableId || Number.isNaN(idNum)) {
        return res.status(400).json({ message: "tableId không hợp lệ" });
      }

      const validStatuses = ["available", "reserved", "occupied", "disabled"];
      if (!status || typeof status !== "string" || !validStatuses.includes(status)) {
        return res.status(400).json({ message: "Trạng thái không hợp lệ" });
      }

      const updated = await prismaClient.tables.update({
        where: { table_id: idNum },
        data: { status: status as any }, // enum lowercase nên OK
      });

      return res.json({
        message: "Cập nhật trạng thái thành công",
        data: { ...updated, table_id: updated.table_id.toString() },
      });
    } catch (error: any) {
      console.error("Error update status:", error);

      if (error?.code === "P2025") {
        return res.status(404).json({ message: "Không tìm thấy bàn để cập nhật" });
      }

      return res.status(500).json({ message: "Lỗi server", detail: error?.message });
    }
  };

  deleteTable = async (req: Request, res: Response) => {
    try {
      const { tableId } = req.params;

      await prismaClient.tables.delete({
        where: { table_id: Number(tableId) },
      });

      return res.json({
        message: "Xoá bàn thành công",
        id: tableId,
      });
    } catch (error: any) {
      console.error("Error deleting table:", error);
      if (error?.code === "P2025") {
        return res.status(404).json({ message: "Không tìm thấy bàn để xoá" });
      }
      return res.status(500).json({ message: "Lỗi server" });
    }
  };
}

export default new TableController();
