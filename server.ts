import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// API health endpoint (useful for network connectivity checks)
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    app: "HerCadence: Period Tracker",
    timestamp: new Date().toISOString(),
    online: true,
  });
});

// API 404 fallback for unrecognized API endpoints
app.all("/api/*", (req, res) => {
  res.status(404).json({
    error: "404 Not Found",
    message: `API route ${req.method} ${req.path} does not exist.`,
  });
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`HerCadence server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
