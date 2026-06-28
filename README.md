# Phone Store API

> **Portfolio demonstration** — Express REST API starter for a phone retail catalog with JWT auth, cart routes, and webhook stubs. Learning project for e-commerce backend patterns, not a live storefront.

## Problem

Practice inventory-aware checkout, authenticated cart mutations, and HMAC-signed order webhooks similar to production payment providers.

## Stack

- Node.js 20+ · Express · MongoDB (optional) · JWT · express-rate-limit

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Server runs at http://localhost:4000

## Endpoints (starter)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| GET | `/products` | List catalog (in-memory demo) |
| POST | `/auth/register` | Register customer |
| POST | `/auth/login` | JWT login |
| POST | `/cart/items` | Add item (auth) |
| POST | `/webhooks/register` | Register order callback URL |

## Disclaimer

Portfolio starter linked from [zacharyahutton/portfolio](https://github.com/zacharyahutton/portfolio). MongoDB persistence and atomic inventory decrements are described in the case study; this repo uses in-memory stores for easy cloning.

## License

MIT
