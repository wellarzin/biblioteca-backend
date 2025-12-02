import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/:bookId", authMiddleware, async (req: AuthRequest, res) => {
  const bookId = Number(req.params.bookId);
  const { rating, comment } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: "Invalid rating" });

  const review = await prisma.review.create({
    data: { userId: req.user.id, bookId, rating, comment }
  });
  res.json(review);
});

router.post("/response/:reviewId", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  const reviewId = Number(req.params.reviewId);
  const { response } = req.body;
  const updated = await prisma.review.update({ where: { id: reviewId }, data: { response } });
  res.json(updated);
});

router.get("/book/:bookId", async (req, res) => {
  const bookId = Number(req.params.bookId);
  const reviews = await prisma.review.findMany({ where: { bookId }, include: { user: true } });
  res.json(reviews);
});

export default router;
