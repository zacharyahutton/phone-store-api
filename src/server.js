import bcrypt from "bcryptjs";
import express from "express";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET ?? "portfolio-demo";
const users = new Map();
const carts = new Map();
const orders = [];
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

app.get("/products", (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(50, Number(req.query.pageSize ?? 10));
  const start = (page - 1) * pageSize;
  const slice = products.slice(start, start + pageSize);
  res.json({ data: slice, page, pageSize, total: products.length });
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

app.get("/cart", auth, (req, res) => {
  res.json({ cart: carts.get(req.user.sub) ?? [] });
});

app.post("/cart/items", auth, (req, res) => {
  const { productId, qty = 1 } = req.body ?? {};
  const product = products.find((p) => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  const cart = carts.get(req.user.sub) ?? [];
  const existing = cart.find((line) => line.productId === productId);
  if (existing) existing.qty += qty;
  else cart.push({ productId, qty });
  carts.set(req.user.sub, cart);
  res.status(201).json({ cart });
});

app.post("/checkout", auth, (req, res) => {
  const email = req.user.sub;
  const cart = carts.get(email) ?? [];
  if (cart.length === 0) return res.status(400).json({ error: "Cart is empty" });

  let total = 0;
  for (const line of cart) {
    const product = products.find((p) => p.id === line.productId);
    if (!product || product.stock < line.qty) {
      return res.status(409).json({ error: "Insufficient stock", productId: line.productId });
    }
  }

  for (const line of cart) {
    const product = products.find((p) => p.id === line.productId);
    product.stock -= line.qty;
    total += product.price * line.qty;
  }

  const order = {
    id: `ord_${orders.length + 1}`,
    email,
    items: [...cart],
    total,
    status: "confirmed",
    createdAt: new Date().toISOString(),
  };
  orders.push(order);
  carts.set(email, []);

  res.status(201).json({ order, message: "Checkout stub complete (no payment processor)" });
});

app.post("/webhooks/register", auth, (req, res) => {
  webhookUrl = req.body?.url ?? null;
  res.json({ message: "Webhook registered", url: webhookUrl });
});

const port = Number(process.env.PORT ?? 4000);
app.listen(port, () => console.log(`phone-store-api listening on :${port}`));
