import request from "supertest";
import { app } from "../src/server.js";

process.env.NODE_ENV = "test";
const res = await request(app).get("/products?page=1&pageSize=3");
console.log(JSON.stringify(res.body, null, 2));
