const express = require("express");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();
const db = require("../database/db");

// Middleware untuk memeriksa role "admin"
function isAdmin(req, res, next) {
  if (req.session.role !== "admin") {
    return res.redirect("/home"); // Jika bukan admin, arahkan ke halaman user
  }
  next();
}

// Route untuk halaman utama admin
router.get("/", isAuthenticated, (req, res) => {
    const query = "SELECT * FROM films"; // Query untuk mengambil semua data film
    db.query(query, (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send("Error fetching films");
      } else {
        // Kirimkan data film dan username ke view
        res.render("admin", {
          films: results,
          username: req.session.username, // Pastikan username ada di session
        });
      }
    });
  });
  
module.exports = router;