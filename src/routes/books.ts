import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

router.get("/", async (req, res) => {
  const books = await prisma.book.findMany();
  res.json(books);
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const book = await prisma.book.findUnique({ where: { id }, include: { reviews: true } });
  res.json(book);
});

router.post("/", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  const { title, author, isbn, description, copiesTotal } = req.body;
  const book = await prisma.book.create({
    data: { title, author, isbn, description, copiesTotal: copiesTotal || 1, copiesAvail: copiesTotal || 1 }
  });
  res.json(book);
});

router.put("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  const data = req.body;
  const book = await prisma.book.update({ where: { id }, data });
  res.json(book);
});

router.delete("/:id", authMiddleware, adminOnly, async (req, res) => {
  const id = Number(req.params.id);
  await prisma.book.delete({ where: { id } });
  res.json({ message: "Deleted" });
});

export default router;
