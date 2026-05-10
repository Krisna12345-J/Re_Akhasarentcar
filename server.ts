import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Akhasarentcar API" });
  });

  // Cars CRUD
  app.get("/api/cars", (req, res) => {
    // In production, fetch from Firestore or MySQL
    res.json({ data: [] });
  });

  app.post("/api/bookings/check", async (req, res) => {
    const { carId, startDate, endDate } = req.body;
    
    if (!carId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing parameters" });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Backend anti-double booking logic
    // In a real implementation with Firestore/MySQL:
    // const existingBookings = await db.collection('bookings')
    //   .where('carId', '==', carId)
    //   .where('status', 'in', ['dikonfirmasi', 'menunggu'])
    //   .get();
    // 
    // const isOverlapping = existingBookings.some(b => {
    //   const bStart = new Date(b.startDate);
    //   const bEnd = new Date(b.endDate);
    //   return (start < bEnd && end > bStart);
    // });

    console.log(`Checking availability for car ${carId} from ${startDate} to ${endDate}`);
    res.json({ available: true, message: "Armada tersedia untuk tanggal tersebut." });
  });

  app.post("/api/admin/bookings/:id/confirm", (req, res) => {
    // Logic to confirm payment
    res.json({ success: true, message: "Pembayaran dikonfirmasi." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
