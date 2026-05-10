import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./src/lib/db.ts";
import { CAR_DATA } from "./src/constants.ts";

const JWT_SECRET = process.env.JWT_SECRET || "akhasa_secret_key_2024";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // --- SEEDER DATA MOBIL ---
  const seedCars = () => {
    const count = db.prepare("SELECT COUNT(*) as count FROM cars").get() as any;
    if (count.count === 0) {
      const insert = db.prepare("INSERT INTO cars (id, name, category, price, transmission, isDriverIncluded) VALUES (?, ?, ?, ?, ?, ?)");
      CAR_DATA.forEach((car, index) => {
        insert.run(`car_seed_${index}`, car.name, car.category, car.price, car.transmission, car.isDriverIncluded ? 1 : 0);
      });
      console.log("Database seeded with cars");
    }
  };
  seedCars();

  // --- MIDDLEWARE ---
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: "Invalid token" });
    }
  };

  const adminOnly = (req: any, res: any, next: any) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: "Forbidden: Admin Only" });
    next();
  };

  // --- API ROUTES ---

  // Auth: Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { name, email, password, phone } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const id = Date.now().toString();
      
      // Auto-admin for specific emails
      const adminEmails = ['admin@akhasarentcar.com', 'kdwi0205@gmail.com', 'admin321@gmail.com'];
      const role = adminEmails.includes(email.toLowerCase()) ? 'admin' : 'customer';
      const isAdmin = role === 'admin' ? 1 : 0;

      const stmt = db.prepare("INSERT INTO users (id, name, email, password, phone, role, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?)");
      stmt.run(id, name, email, hashedPassword, phone || '-', role, isAdmin);

      const token = jwt.sign({ id, email, role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true });
      res.json({ user: { id, name, email, role } });
    } catch (err: any) {
      res.status(400).json({ error: err.message.includes('UNIQUE') ? "Email sudah terdaftar" : "Gagal mendaftar" });
    }
  });

  // Auth: Login
  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Auth: Get Profile
  app.get("/api/auth/me", authenticate, (req: any, res) => {
    const user = db.prepare("SELECT id, name, email, role, phone FROM users WHERE id = ?").get(req.user.id);
    res.json(user);
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ status: 'ok' });
  });

  // Cars
  app.get("/api/cars", (req, res) => {
    const cars = db.prepare("SELECT * FROM cars").all();
    res.json(cars);
  });

  // Bookings: List (Admin sees all, Customer sees theirs)
  app.get("/api/bookings", authenticate, (req: any, res) => {
    let stmt;
    if (req.user.role === 'admin') {
      stmt = db.prepare("SELECT * FROM bookings ORDER BY createdAt DESC");
    } else {
      stmt = db.prepare("SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC");
    }
    const bookings = stmt.all(req.user.role === 'admin' ? [] : [req.user.id]);
    res.json(bookings);
  });

  // Bookings: Create
  app.post("/api/bookings", authenticate, (req: any, res) => {
    const { carId, userName, userPhone, startDate, endDate, totalPrice } = req.body;
    const id = `book_${Date.now()}`;
    const stmt = db.prepare("INSERT INTO bookings (id, userId, userName, userPhone, carId, startDate, endDate, totalPrice) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
    stmt.run(id, req.user.id, userName, userPhone, carId, startDate, endDate, totalPrice);
    res.json({ id, status: 'menunggu' });
  });

  // Bookings: Update Status (Admin Only)
  app.patch("/api/bookings/:id", authenticate, adminOnly, (req, res) => {
    const { status } = req.body;
    db.prepare("UPDATE bookings SET status = ? WHERE id = ?").run(status, req.params.id);
    res.json({ status: 'updated' });
  });

  // Stats (Admin Only)
  app.get("/api/admin/stats", authenticate, adminOnly, (req, res) => {
    const totalCars = db.prepare("SELECT COUNT(*) as count FROM cars").get() as any;
    const totalRevenue = db.prepare("SELECT SUM(totalPrice) as sum FROM bookings WHERE status = 'lunas'").get() as any;
    const activeBookings = db.prepare("SELECT COUNT(*) as count FROM bookings WHERE status = 'menunggu'").get() as any;
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;

    res.json({
      totalCars: totalCars.count,
      monthlyRevenue: totalRevenue.sum || 0,
      activeBookings: activeBookings.count,
      newCustomers: totalUsers.count
    });
  });

  app.post("/api/admin/seed", authenticate, adminOnly, (req, res) => {
    try {
      db.prepare("DELETE FROM cars").run();
      const insert = db.prepare("INSERT INTO cars (id, name, category, price, transmission, isDriverIncluded, status) VALUES (?, ?, ?, ?, ?, ?, ?)");
      CAR_DATA.forEach((car, index) => {
        insert.run(`car_seed_${index}`, car.name, car.category, car.price, car.transmission, car.isDriverIncluded ? 1 : 0, 'tersedia');
      });
      res.json({ status: 'seeded' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
