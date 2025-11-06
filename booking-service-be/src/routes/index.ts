import { Router } from "express";
import { getHealth } from "../controllers/health.controller";

const router = Router();

router.get("/health", getHealth);

// demo route có query param
router.get("/hello", (req, res) => {
  const name = (req.query.name as string) || "World";
  res.json({ message: `Hello, ${name}!` });
});

export default router;
