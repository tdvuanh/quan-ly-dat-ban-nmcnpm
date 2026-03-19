import { Request, Response } from "express";
import prismaClient from "../config/prisma";

class CustomerController {
  getCustomers = async (_req: Request, res: Response) => {
    try {
      const customers = await prismaClient.customers.findMany({
        orderBy: {
          created_at: "desc",
        },
      });

      return res.json({
        customers,
      });
    } catch (error) {
      console.error("Error fetching customers:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  getCustomerById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Thiếu customer_id" });
      }

      const customer = await prismaClient.customers.findUnique({
        where: { customer_id: id },
      });

      if (!customer) {
        return res.status(404).json({ message: "Không tìm thấy khách hàng" });
      }

      return res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  getCustomerByPhone = async (req: Request, res: Response) => {
    try {
      const { phone } = req.params;

      if (!phone) {
        return res.status(400).json({ message: "Thiếu số điện thoại" });
      }

      const customer = await prismaClient.customers.findUnique({
        where: { phone },
      });

      if (!customer) {
        return res.status(404).json({ message: "Không tìm thấy khách hàng" });
      }

      return res.json(customer);
    } catch (error) {
      console.error("Error fetching customer by phone:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  createCustomer = async (req: Request, res: Response) => {
    try {
      const { full_name, phone } = req.body;

      if (!full_name || typeof full_name !== "string") {
        return res.status(400).json({ message: "Họ tên không hợp lệ" });
      }

      if (!phone || typeof phone !== "string") {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
      }

      const newCustomer = await prismaClient.customers.create({
        data: {
          full_name: full_name.trim(),
          phone: phone.trim(),
        },
      });

      return res.status(201).json({
        message: "Tạo khách hàng thành công",
        data: newCustomer,
      });
    } catch (error: any) {
      console.error("Error creating customer:", error);

      if (error?.code === "P2002") {
        return res.status(400).json({
          message: "Số điện thoại đã tồn tại",
        });
      }

      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  upsertCustomer = async (req: Request, res: Response) => {
    try {
      const { full_name, phone } = req.body;

      if (!full_name || typeof full_name !== "string") {
        return res.status(400).json({ message: "Họ tên không hợp lệ" });
      }

      if (!phone || typeof phone !== "string") {
        return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
      }

      const customer = await prismaClient.customers.upsert({
        where: { phone },
        update: {
          full_name: full_name.trim(),
        },
        create: {
          full_name: full_name.trim(),
          phone: phone.trim(),
        },
      });

      return res.json({
        message: "Upsert khách hàng thành công",
        data: customer,
      });
    } catch (error) {
      console.error("Error upsert customer:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  updateCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { full_name, phone } = req.body;

      if (!id) {
        return res.status(400).json({ message: "Thiếu customer_id" });
      }

      const data: any = {};

      if (full_name) {
        if (typeof full_name !== "string") {
          return res.status(400).json({ message: "Họ tên không hợp lệ" });
        }
        data.full_name = full_name.trim();
      }

      if (phone) {
        if (typeof phone !== "string") {
          return res.status(400).json({ message: "Số điện thoại không hợp lệ" });
        }
        data.phone = phone.trim();
      }

      const updated = await prismaClient.customers.update({
        where: { customer_id: id },
        data,
      });

      return res.json({
        message: "Cập nhật khách hàng thành công",
        data: updated,
      });
    } catch (error: any) {
      console.error("Error updating customer:", error);

      if (error?.code === "P2025") {
        return res.status(404).json({ message: "Không tìm thấy khách hàng" });
      }

      if (error?.code === "P2002") {
        return res.status(400).json({
          message: "Số điện thoại đã tồn tại",
        });
      }

      return res.status(500).json({ message: "Lỗi server" });
    }
  };

  deleteCustomer = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ message: "Thiếu customer_id" });
      }

      await prismaClient.customers.delete({
        where: { customer_id: id },
      });

      return res.json({
        message: "Xoá khách hàng thành công",
        id,
      });
    } catch (error: any) {
      console.error("Error deleting customer:", error);

      if (error?.code === "P2025") {
        return res.status(404).json({ message: "Không tìm thấy khách hàng" });
      }

      return res.status(500).json({ message: "Lỗi server" });
    }
  };
}

export default new CustomerController();
