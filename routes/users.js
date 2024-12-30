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

// Route untuk halaman utama user
router.get("/", isAuthenticated, isUser, (req, res) => {
  const username = req.session.username;

  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    res.render("user/home", {
      layout: "layouts/main-layout",
      username,
      films: results,
    });
  });
});

module.exports = router;
