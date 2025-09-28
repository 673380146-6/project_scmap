import jwt from "jsonwebtoken";
import { isTokenBlacklisted } from "../services/auth.service.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      const err = new Error("Missing Authorization header");
      err.statusCode = 401;
      throw err;
    }

    const token = authHeader.split(" ")[1]; // "Bearer <token>"
    if (!token) {
      const err = new Error("Invalid token format");
      err.statusCode = 401;
      throw err;
    }
    if (isTokenBlacklisted(token)) {
      const err = new Error("Token is invalid (logged out)");
      err.statusCode = 401;
      throw err;
  }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // เก็บ user data ใน request
    next();
  } catch (err) {
    err.statusCode = 401;
    next(err);
  }
};