import { VercelRequest, VercelResponse } from "@vercel/node";
import serverlessExpress from "@vendia/serverless-express";
import app from "../dist/index";

const handler = serverlessExpress({ app });

export default function vercelHandler(req: VercelRequest, res: VercelResponse) {
  return handler(req, res);
}
