import prismaClient from "../config/prisma";
import { reservation_status } from "@prisma/client";
import { Request, Response } from "express";

import { startOfDay, addDays, isValid, parseISO, add } from "date-fns";

class ReservationController {
  /** GET /api/reservations */
  async getAll(req: Request, res: Response) {
    try {
      const { status, date, time, duration, customer_phone } = req.query;

      let dateTimeFilter = {};

      if (date) {
        const parsedDate = parseISO(date as string);

        if (!isValid(parsedDate)) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        let start: Date;
        let end: Date;

        if (time) {
          const [hour, minute] = (time as string).split(":").map(Number);

          start = new Date(parsedDate);
          start.setHours(hour, minute, 0, 0);

          const durationHours = Number(duration || 1);
          end = new Date(start);
          end.setHours(start.getHours() + durationHours);
        }
        // 🔥 CASE 2: chỉ có date → lấy cả ngày
        else {
          start = startOfDay(parsedDate);
          end = addDays(start, 1);
        }

        dateTimeFilter = {
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
        };
      }

      const reservations = await prismaClient.reservations.findMany({
        where: {
          ...(status && { status: status as reservation_status }),
          ...(customer_phone && { customer_phone: customer_phone as string }),
          ...dateTimeFilter,
        },
        include: {
          reservation_tables: true,
          payments: true,
        },
        orderBy: { created_at: "desc" },
      });

      return res.json(reservations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  async getByTable(req: Request, res: Response) {
    try {
      const tableId = BigInt(req.params.tableId);
      const { date } = req.query;

      let dateFilter = {};

      if (date) {
        const parsedDate = parseISO(date as string);

        if (!isValid(parsedDate)) {
          return res.status(400).json({ message: "Invalid date format" });
        }

        const start = startOfDay(parsedDate);
        const end = addDays(start, 1);

        dateFilter = {
          checkin_time: {
            gte: start,
            lt: end, // 🔥 nên dùng lt thay vì lte
          },
        };
      }

      const reservations = await prismaClient.reservations.findMany({
        where: {
          ...dateFilter,
          reservation_tables: {
            some: {
              table_id: tableId,
            },
          },
        },
        include: {
          reservation_tables: true,
          payments: true,
        },
        orderBy: {
          checkin_time: "asc",
        },
      });

      return res.json(reservations);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** GET /api/reservations/:id */
  async getById(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);

      const reservation = await prismaClient.reservations.findUnique({
        where: { reservation_id: id },
        include: {
          reservation_tables: true,
          payments: true,
        },
      });

      if (!reservation) {
        return res.status(404).json({ message: "Reservation not found" });
      }

      return res.json(reservation);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** POST /api/reservations */
  async create(req: Request, res: Response) {
    try {
      const {
        customer_name,
        customer_phone,
        checkin_time,
        checkout_time,
        number_of_people,
        status,
        user_id,
        note,
        reservation_tables,
      } = req.body;

      const reservation = await prismaClient.reservations.create({
        data: {
          customer_name,
          customer_phone,
          checkin_time: new Date(checkin_time),
          checkout_time: checkout_time ? new Date(checkout_time) : null,
          number_of_people,
          status,
          user_id,
          note,
          reservation_tables: {
            create: reservation_tables?.map((t: any) => ({
              table_id: t.table_id,
            })),
          },
        },
      });

      return res.status(201).json(reservation);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** PUT /api/reservations/:id */
  async update(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);

      const {
        customer_name,
        customer_phone,
        checkin_time,
        checkout_time,
        number_of_people,
        status,
        user_id,
        note,
      } = req.body;

      const updated = await prismaClient.reservations.update({
        where: { reservation_id: id },
        data: {
          customer_name,
          customer_phone,
          checkin_time: new Date(checkin_time),
          checkout_time: checkout_time ? new Date(checkout_time) : null,
          number_of_people,
          status,
          user_id,
          note,
        },
      });

      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** PATCH /api/reservations/:id */
  async patch(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);

      const updated = await prismaClient.reservations.update({
        where: { reservation_id: id },
        data: req.body,
      });

      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** DELETE /api/reservations/:id */
  async delete(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);

      await prismaClient.reservations.delete({
        where: { reservation_id: id },
      });

      return res.json({ message: "Reservation deleted" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** PATCH /api/reservations/:id/status */
  async updateStatus(req: Request, res: Response) {
    try {
      const id = BigInt(req.params.id);
      const { status } = req.body;

      const updated = await prismaClient.reservations.update({
        where: { reservation_id: id },
        data: { status },
      });

      return res.json(updated);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** POST /api/reservations/:id/tables */
  async addTable(req: Request, res: Response) {
    try {
      const reservation_id = BigInt(req.params.id);
      const { table_id } = req.body;

      const table = await prismaClient.reservation_tables.create({
        data: {
          reservation_id,
          table_id,
        },
      });

      return res.status(201).json(table);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }

  /** DELETE /api/reservations/:id/tables/:table_id */
  async removeTable(req: Request, res: Response) {
    try {
      const reservation_id = BigInt(req.params.id);
      const table_id = BigInt(req.params.table_id);

      await prismaClient.reservation_tables.deleteMany({
        where: { reservation_id, table_id },
      });

      return res.json({ message: "Table removed from reservation" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default new ReservationController();
