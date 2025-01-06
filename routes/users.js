const express = require("express");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();
const db = require("../database/db");

// Middleware untuk memeriksa role "user"
function isUser(req, res, next) {
  if (req.session.role !== "user") {
    return res.status(403).send("Access denied. This page is for users only.");
  }
  next();
}

module.exports = router;