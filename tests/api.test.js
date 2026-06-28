import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { app } from "../src/server.js";

process.env.NODE_ENV = "test";

test("GET /health", async () => {
  const res = await request(app).get("/health");
  assert.equal(res.status, 200);
  assert.equal(res.body.service, "phone-store-api");
});

test("GET /products returns seeded catalog", async () => {
  const res = await request(app).get("/products");
  assert.equal(res.status, 200);
  assert.ok(res.body.data.length >= 1);
});
