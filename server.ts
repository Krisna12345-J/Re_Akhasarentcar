import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import Stripe from "stripe";
import db, { query, getOne, execute, isPostgres } from "./src/lib/db.ts";
import { CAR_DATA } from "./src/constants.ts";

const JWT_SECRET = process.env.JWT_SECRET || "akhasa_secret_key_2024";
const WA_NUMBER = process.env.WA_NUMBER || "6288211542209";

let stripeClient: Stripe | null = null;
function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY environment variable is required");
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // --- SEEDER DATA ---
  const seedData = async () => {
    try {
      const countRes = await getOne("SELECT COUNT(*) as count FROM cars");
      if (countRes && countRes.count === 0) {
        for (let i = 0; i < CAR_DATA.length; i++) {
          const car = CAR_DATA[i];
          await execute(
            "INSERT INTO cars (id, name, category, price, transmission, isDriverIncluded) VALUES ($1, $2, $3, $4, $5, $6)",
            [`car_seed_${i}`, car.name, car.category, car.price, car.transmission, car.isDriverIncluded ? 1 : 0]
          );
        }
        console.log("Database seeded with cars");
      }

      // Admin Seeder
      const adminEmail = 'admin@akhasarentcar.com';
      const existingAdmin = await getOne("SELECT * FROM users WHERE email = $1", [adminEmail]);
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash("admin123", 10);
        await execute(
          "INSERT INTO users (id, name, email, password, phone, role, isAdmin) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [Date.now().toString(), "Admin Akhasa", adminEmail, hashedPassword, "-", "admin", 1]
        );
        console.log("Admin account created: admin@akhasarentcar.com / admin123");
      }
    } catch (err) {
      console.error("Seeding Error:", err);
    }
  };
  seedData();

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
      const isAdmin = role === 'admin' ? (isPostgres ? true : 1) : (isPostgres ? false : 0);

      await execute(
        "INSERT INTO users (id, name, email, password, phone, role, isAdmin) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [id, name, email, hashedPassword, phone || '-', role, isAdmin]
      );

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
    const user = await getOne("SELECT * FROM users WHERE email = $1", [email]);
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Email atau password salah" });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true });
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  });

  // Auth: Get Profile
  app.get("/api/auth/me", authenticate, async (req: any, res) => {
    const user = await getOne("SELECT id, name, email, role, phone FROM users WHERE id = $1", [req.user.id]);
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
  app.get("/api/bookings", authenticate, async (req: any, res) => {
    let bookings;
    if (req.user.role === 'admin') {
      bookings = await query("SELECT * FROM bookings ORDER BY createdAt DESC");
    } else {
      bookings = await query("SELECT * FROM bookings WHERE userId = $1 ORDER BY createdAt DESC", [req.user.id]);
    }
    res.json(bookings);
  });

  // Bookings: Create
  app.post("/api/bookings", authenticate, async (req: any, res) => {
    const { carId, userName, userPhone, startDate, endDate, totalPrice } = req.body;
    const id = `book_${Date.now()}`;
    await execute(
      "INSERT INTO bookings (id, userId, userName, userPhone, carId, startDate, endDate, totalPrice) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
      [id, req.user.id, userName, userPhone, carId, startDate, endDate, totalPrice]
    );
    res.json({ id, status: 'menunggu' });
  });

  // Bookings: Update Status (Admin Only)
  app.patch("/api/bookings/:id", authenticate, adminOnly, async (req, res) => {
    const { status } = req.body;
    await execute("UPDATE bookings SET status = $1 WHERE id = $2", [status, req.params.id]);
    res.json({ status: 'updated' });
  });

  // Stripe: Create Payment Intent
  app.post("/api/payments/create-intent", authenticate, async (req: any, res) => {
    try {
      const { bookingId } = req.body;
      const booking = await getOne("SELECT * FROM bookings WHERE id = $1 AND userId = $2", [bookingId, req.user.id]);
      
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }

      const stripe = getStripe();
      const intent = await stripe.paymentIntents.create({
        amount: booking.totalPrice,
        currency: "idr",
        metadata: { bookingId: booking.id },
      });

      res.json({ clientSecret: intent.client_secret });
    } catch (err: any) {
      console.error("Stripe Error:", err.message);
      res.status(500).json({ error: "Gagal memproses pembayaran. Pastikan STRIPE_SECRET_KEY sudah diatur." });
    }
  });

  // Stripe: Confirm Payment
  app.post("/api/payments/confirm", authenticate, async (req: any, res) => {
    try {
      const { bookingId } = req.body;
      await execute("UPDATE bookings SET status = 'lunas' WHERE id = $1", [bookingId]);
      res.json({ status: 'paid' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Stats (Admin Only)
  app.get("/api/admin/stats", authenticate, adminOnly, async (req, res) => {
    const totalCars = await getOne("SELECT COUNT(*) as count FROM cars");
    const totalRevenue = await getOne("SELECT SUM(totalPrice) as sum FROM bookings WHERE status = 'lunas'");
    const activeBookings = await getOne("SELECT COUNT(*) as count FROM bookings WHERE status = 'menunggu'");
    const totalUsers = await getOne("SELECT COUNT(*) as count FROM users");

    res.json({
      totalCars: totalCars?.count || 0,
      monthlyRevenue: totalRevenue?.sum || 0,
      activeBookings: activeBookings?.count || 0,
      newCustomers: totalUsers?.count || 0
    });
  });

  app.post("/api/admin/seed", authenticate, adminOnly, async (req, res) => {
    try {
      await execute("DELETE FROM cars");
      for (let i = 0; i < CAR_DATA.length; i++) {
        const car = CAR_DATA[i];
        await execute(
          "INSERT INTO cars (id, name, category, price, transmission, isDriverIncluded, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [`car_seed_${i}`, car.name, car.category, car.price, car.transmission, car.isDriverIncluded ? 1 : 0, 'tersedia']
        );
      }
      res.json({ status: 'seeded' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Config: Expose safe environment variables
  app.get("/api/config", (req, res) => {
    res.json({
      WA_NUMBER: process.env.WA_NUMBER || "6288211542209",
    });
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
