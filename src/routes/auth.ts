import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { prisma } from "../prisma";

dotenv.config();
const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Na rota de registro
router.post("/register", async (req, res) => {
  console.log("📥 Dados recebidos:", req.body);

  const { email, password, name } = req.body;

  console.log("📧 Email:", email);
  console.log("🔑 Password:", password ? "***" : "vazio");
  console.log("👤 Name:", name);

  if (!email || !password || !name) {
    console.log("❌ Campos faltando!");
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, name },
    });

    console.log("✅ Usuário criado:", user.email);
    // ... resto do código
  } catch (error) {
    console.error("❌ Erro no registro:", error);
    res.status(500).json({ message: "Error creating user" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Missing fields" });
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid credentials" });

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
  });
});

export default router;
