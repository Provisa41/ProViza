import type { Express } from "express";
import { getBot } from "./bot/instance.js";
import { createServer } from "./server.js";

let app: Express | undefined;

/** Shared Express app for local server and Vercel serverless */
export function getApp(): Express {
  if (!app) {
    app = createServer(getBot());
  }
  return app;
}
