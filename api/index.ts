import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverlessExpress from "@vendia/serverless-express";
import app from "../src/index"; // ← pega o express antes do build

const handler = serverlessExpress({ app });

export default function vercelHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
