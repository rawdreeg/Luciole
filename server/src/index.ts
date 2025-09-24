import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import routes from "./routes";
import { WebSocketService } from "./services/WebSocketService";
import { errorHandler } from "./middleware/errorHandler";
import morgan from "morgan";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

(async () => {
  if (!process.env.JWT_SECRET) {
    log("FATAL ERROR: JWT_SECRET is not set.", "server");
    process.exit(1);
  }

  const server = createServer(app);
  new WebSocketService(server);

  app.use("/api", routes);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
