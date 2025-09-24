import express from "express";
import { createServer } from "http";
import { setupVite, serveStatic, log } from "./vite";
import routes from "./routes";
import { WebSocketService } from "./services/WebSocketService";
import { errorHandler } from "./middleware/errorHandler";
import morgan from "morgan";

/**
 * The main Express application instance.
 * @type {express.Express}
 */
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));

/**
 * The main entry point of the server application.
 * This function sets up the Express server, WebSocket service, routes,
 * and starts listening for incoming connections.
 */
(async () => {
  if (!process.env.JWT_SECRET) {
    log("FATAL ERROR: JWT_SECRET is not set.", "server");
    process.exit(1);
  }

  const server = createServer(app);
  new WebSocketService(server);

  app.use("/api", routes);

  // Importantly, only set up Vite in development and after
  // setting up all other routes, so the catch-all route
  // doesn't interfere with other routes.
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  app.use(errorHandler);

  // ALWAYS serve the app on the port specified in the environment variable PORT.
  // Other ports are firewalled. Default to 5000 if not specified.
  // This serves both the API and the client and is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
