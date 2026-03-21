// controllers/user.controller.ts
import { Request, Response } from "express";
import prismaClient from "../config/prisma";

class UserController {
  /** POST /api/users/login */
  async login(req: Request, res: Response) {
    try {
      const { user_name, password } = req.body;

      // ✅ validate
      if (!user_name || typeof user_name !== "string") {
        return res.status(400).json({ message: "Tên đăng nhập không hợp lệ" });
      }

      if (!password || typeof password !== "string") {
        return res.status(400).json({ message: "Mật khẩu không hợp lệ" });
      }

      // 🔍 tìm user
      const user = await prismaClient.users.findUnique({
        where: {
          email: user_name.trim(),
        },
      });

      // ❌ không tồn tại
      if (!user) {
        return res.status(404).json({
          message: "Không tìm thấy tài khoản",
        });
      }

      // ❌ sai mật khẩu (simple version)
      if (user.password_hash !== password) {
        return res.status(401).json({
          message: "Sai mật khẩu",
        });
      }

      // ✅ login success
      return res.status(200).json({
        message: "Đăng nhập thành công",
        data: {
          user_id: user.user_id,
          user_name: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("Error login user:", error);
      return res.status(500).json({ message: "Lỗi server" });
    }
  }
}

export default new UserController();
