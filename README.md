# Phone Store API

Phone Store API is a **portfolio demonstration** Express REST service for a fictional phone catalog. It covers JWT registration/login, paginated product listing, cart mutations, and a checkout stub that decrements in-memory inventory. It mirrors e-commerce backend patterns without MongoDB or a payment processor.

## Stack

- Node.js 20+, Express
- JWT (jsonwebtoken), bcryptjs
- express-rate-limit
- In-memory stores (users, carts, products, orders)

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
git clone https://github.com/zacharyahutton/phone-store-api.git
cd phone-store-api
npm install
cp .env.example .env   # optional; defaults work locally
```

## How to run

```bash
npm run dev
```

Base URL: http://localhost:4000

## How to test

Register and login:

```bash
curl -s -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer@example.com\",\"password\":\"password123\"}"

curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"buyer@example.com\",\"password\":\"password123\"}"
```

List products:

```bash
curl -s "http://localhost:4000/products?page=1&pageSize=10"
```

Add to cart and checkout (replace `TOKEN`):

```bash
curl -s -X POST http://localhost:4000/cart/items \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"productId\":\"p1\",\"qty\":1}"

curl -s http://localhost:4000/cart -H "Authorization: Bearer TOKEN"

curl -s -X POST http://localhost:4000/checkout -H "Authorization: Bearer TOKEN"
```

Sample checkout response shape:

```json
{"order":{"id":"ord_1","total":899,"status":"confirmed","items":[{"productId":"p1","qty":1}]},"message":"Checkout stub complete (no payment processor)"}
```

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/health` | No | Health check |
| GET | `/products` | No | Paginated catalog |
| POST | `/auth/register` | No | Create account |
| POST | `/auth/login` | No | JWT login |
| GET | `/cart` | Bearer | View cart |
| POST | `/cart/items` | Bearer | Add or increment line item |
| POST | `/checkout` | Bearer | Stub checkout + stock decrement |
| POST | `/webhooks/register` | Bearer | Register order webhook URL (stub) |

## Project structure

```
src/
  server.js       Express app and routes
.env.example      Optional JWT_SECRET and PORT
```

## Portfolio disclaimer

Linked from the [Phone Store API case study](https://github.com/zacharyahutton/portfolio). The case study mentions MongoDB, refresh tokens, and HMAC order webhooks; **this repo uses in-memory data** so you can run it with zero external services.

## Future improvements

- MongoDB persistence and atomic inventory updates
- Refresh tokens and admin inventory routes
- Fire HMAC-signed webhooks on checkout

## License

MIT
