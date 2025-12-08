import { Router } from "express";
import { prisma } from "../prisma";
import { authMiddleware, adminOnly, AuthRequest } from "../middleware/auth";

const router = Router();

router.post("/reserve/:bookId", authMiddleware, async (req: AuthRequest, res) => {
  const bookId = Number(req.params.bookId);
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return res.status(404).json({ message: "Book not found" });
  if (book.copiesAvail < 1) return res.status(400).json({ message: "No copies available" });

  const loan = await prisma.loan.create({
    data: {
      userId: req.user.id,
      bookId,
      type: "RESERVATION",
      status: "RESERVED"
    }
  });

  await prisma.book.update({ where: { id: bookId }, data: { copiesAvail: book.copiesAvail - 1 } });

  res.json(loan);
});

router.post("/approve/:loanId", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  const loanId = Number(req.params.loanId);
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const startDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(startDate.getDate() + 14); 

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: { status: "BORROWED", startDate, dueDate }
  });

  res.json(updated);
});

router.post("/return/:loanId", authMiddleware, async (req: AuthRequest, res) => {
  const loanId = Number(req.params.loanId);
  const loan = await prisma.loan.findUnique({ where: { id: loanId } });
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  await prisma.loan.update({ where: { id: loanId }, data: { status: "RETURNED", returnDate: new Date() } });

  const book = await prisma.book.findUnique({ where: { id: loan.bookId } });
  if (book) await prisma.book.update({ where: { id: book.id }, data: { copiesAvail: book.copiesAvail + 1 } });

  res.json({ message: "Returned" });
});

router.get("/", authMiddleware, async (req: AuthRequest, res) => {
  if (req.user.role === "ADMIN") {
    const all = await prisma.loan.findMany({ include: { book: true, user: true } });
    return res.json(all);
  } else {
    const mine = await prisma.loan.findMany({ where: { userId: req.user.id }, include: { book: true } });
    return res.json(mine);
  }
});

router.post("/reject/:loanId", authMiddleware, adminOnly, async (req: AuthRequest, res) => {
  const loanId = Number(req.params.loanId);
  const { adminNote } = req.body;
  
  const loan = await prisma.loan.findUnique({ where: { id: loanId }, include: { book: true } });
  if (!loan) return res.status(404).json({ message: "Loan not found" });

  const updated = await prisma.loan.update({
    where: { id: loanId },
    data: { status: "REJECTED", adminNote }
  });

  // Devolver a cópia ao estoque
  await prisma.book.update({ 
    where: { id: loan.bookId }, 
    data: { copiesAvail: loan.book.copiesAvail + 1 } 
  });

  res.json(updated);
});

export default router;
