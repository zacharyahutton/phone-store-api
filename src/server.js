import bcrypt from "bcryptjs";
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET ?? "portfolio-demo";
const users = new Map();
const carts = new Map();
let webhookUrl = null;

const products = [
  { id: "p1", name: "Pixel Pro 12", price: 899, stock: 5 },
  { id: "p2", name: "Galaxy Ultra S", price: 1099, stock: 3 },
  { id: "p3", name: "iPhone Air", price: 999, stock: 8 },
];

const limiter = rateLimit({ windowMs: 60_000, max: 100 });
app.use(limiter);

function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing token" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "phone-store-api" });
});

app.get("/products", (_req, res) => {
  res.json({ data: products, page: 1 });
});

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "email and password required" });
  if (users.has(email)) return res.status(409).json({ error: "Email taken" });
  users.set(email, await bcrypt.hash(password, 10));
  carts.set(email, []);
  res.status(201).json({ message: "Registered" });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  const hash = users.get(email);
  if (!hash || !(await bcrypt.compare(password, hash))) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ sub: email }, JWT_SECRET, { expiresIn: "1h" });
  res.json({ access_token: token, token_type: "bearer" });
});

app.post("/cart/items", auth, (req, res) => {
  const { productId, qty = 1 } = req.body ?? {};
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const cart = carts.get(req.user.sub) ?? [];
  cart.push({ productId, qty });
  carts.set(req.user.sub, cart);
  res.status(201).json({ cart });
});

app.post("/webhooks/register", auth, (req, res) => {
  webhookUrl = req.body?.url ?? null;
  res.json({ message: "Webhook registered", url: webhookUrl });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`phone-store-api listening on :${port}`));
