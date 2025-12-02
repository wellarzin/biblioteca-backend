import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", authMiddleware, adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/me", authMiddleware, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.get("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.put("/me", authMiddleware, async (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });
  try {
    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: { name },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const { name, role } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { ...(name ? { name } : {}), ...(role ? { role } : {}) },
      select: { id: true, email: true, name: true, role: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err });
  }
});

export default router;
