<<<<<<< HEAD
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
=======
# 🧩 Mini App Đặt Bàn Nhà Hàng

**Số lượng sinh viên yêu cầu:** 3–4 sinh viên

---

## 📝 Mô tả đề tài

### a. Chức năng chính của phần mềm _(Sơn + Vũ Anh)_

- **Quản lý bàn:** thêm, sửa, xóa, tìm kiếm, hiển thị danh sách.
- **Quản lý đặt bàn:** tạo đặt bàn, cập nhật, hủy đặt bàn, xử lý thanh toán.
- **Giao diện người dùng:** trực quan, bao gồm trang chủ, danh sách bàn, lịch đặt, thông báo. _(Giao diện: Nghĩa)_

---

### b. Chức năng kiểm thử và đánh giá chất lượng _(Minh follow)_

- **Kiểm thử đơn vị:** JUnit
- **Kiểm thử giao diện:** Selenium
- **Kiểm thử API:** Postman / MockMvc

---

### c. Báo cáo thống kê và cải tiến

- Báo cáo test case (Pass/Fail), tỷ lệ bao phủ kiểm thử.
- Đề xuất cải tiến (ví dụ: gợi ý bàn trống tự động).

---

### d. Công cụ phát triển và kiểm thử

| Thành phần           | Công cụ / Công nghệ                                   |
| -------------------- | ----------------------------------------------------- |
| **Backend**          | Java Spring Boot                                      |
| **CSDL**             | H2 / MySQL                                            |
| **Kiểm thử**         | JUnit, Selenium, Postman, Mockito                     |
| **IDE**              | Visual Studio Code                                    |
| **Quản lý mã nguồn** | GitHub (repo nhóm, public)                            |
| **Quy trình**        | Agile-Scrum, CI/CD, DevOps (Jenkins / GitHub Actions) |

---

## 👥 Yêu cầu nhóm và học viên

### Câu 1 – [CLO1]

Thực hiện đúng tiến độ **Agile-Scrum** (Sprint backlog, Daily Scrum, Review/Retrospective).  
Mỗi thành viên đảm nhiệm một chức năng: backend, frontend, testing, CI/CD.

### Câu 2 – [CLO1]

Xác định kỹ thuật kiểm thử, demo test case.

### Câu 3 – [CLO2]

Báo cáo slide (10–15 phút): **kết quả, hạn chế, hướng phát triển.**
>>>>>>> 8451866c652b8341c5108392a5f94e603aff00b9
