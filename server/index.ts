import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

const SessionStore = MemoryStore(session) as any;

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new SessionStore(),
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production" && process.env.RENDER !== "true",
      sameSite: "lax",
    },
  }),
);

export function log(message: string, source = "app") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const logMessage = `${formattedTime} [${source}] ${message}`;
  console.log(logMessage);

  // Highlight important filter and verification messages
  if (source === "signal-filter" || source === "signal-verified" || source === "signal-partial") {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    await registerRoutes(httpServer, app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      log(`Error: ${message}`, "error");
      res.status(status).json({ message });
      
      if (process.env.NODE_ENV === "development") {
        console.error(err);
      }
    });
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (err) => {
      log(`Uncaught Exception: ${err.message}`, "error");
      console.error('Uncaught Exception:', err);
    });
    
    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      log(`Unhandled Rejection at: ${promise}, reason: ${reason}`, "error");
      console.error('Unhandled Rejection:', reason);
    });

    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  } catch (error: any) {
    log(`Startup Error: ${error.message}`, "error");
    console.error("Critical failure during startup:", error);
    process.exit(1);
  }
})();