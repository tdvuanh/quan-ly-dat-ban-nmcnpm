import prismaClient from "../config/prisma";
import { Request, Response } from "express";

export const getTables = async (_req: Request, res: Response) => {
  try {
    const tables = await prismaClient.tables.findMany();
    return res.json(tables);
  } catch (error) {
    console.error("Error creating table:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const createTables = async (_req: Request, res: Response) => {
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

export const updateTableStatus = async (_req: Request, res: Response) => {
  try {
    const { tableId } = _req.params;
    const { status } = _req.body;

    const validStatuses = ["available", "serving", "booked"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updated = await prismaClient.tables.update({
      where: { table_id: Number(tableId) },
      data: { status },
    });

    return res.json({
      message: "Cập nhật trạng thái thành công",
      data: {
        ...updated,
        table_id: updated.table_id.toString(),
      },
    });
  } catch (error) {
    console.error("Error update status:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const { tableId } = req.params;

    await prismaClient.tables.delete({
      where: { table_id: Number(tableId) },
    });

    return res.json({
      message: "Xoá bàn thành công",
      id: tableId,
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    return res.status(500).json({ message: "Lỗi server" });
  }
};
