import express from "express";
import { createServer, Server } from "http";
import { setupVite, serveStatic, log } from "./vite.js";
import router from "./routes/index.js";
import { WebSocketService } from "./services/WebSocketService.js";
import { errorHandler } from "./middleware/errorHandler";
import morgan from "morgan";

export const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

export let webSocketService: WebSocketService;
let server: Server;

export async function start() {
  log("Starting server...", "server");
  if (!process.env.JWT_SECRET) {
    log("FATAL ERROR: JWT_SECRET is not set.", "server");
    process.exit(1);
  }

  server = createServer(app);
  webSocketService = new WebSocketService(server);

  app.use("/api", router);

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else if (process.env.NODE_ENV !== "test") {
    serveStatic(app);
  }

  app.use(errorHandler);

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}

export function close() {
  log("Closing server...", "server");
  server.close((err) => {
    if (err) {
      log(`Error closing server: ${err}`, "server");
    } else {
      log("Server closed.", "server");
    }
  });
}

if (process.env.NODE_ENV !== "test") {
  start();
}