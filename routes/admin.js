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
  

// Route untuk mengelola film
router.get("/manage-films", isAuthenticated, isAdmin, (req, res) => {
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    res.render("admin", {
        layout: "admin", // Pastikan ini sesuai dengan file layout admin Anda
      films: results,
    });
  });
});

// Route untuk menghapus film
router.post("/delete-film/:id", isAuthenticated, isAdmin, (req, res) => {
  const filmId = req.params.id;

  db.query("DELETE FROM films WHERE id = ?", [filmId], (err) => {
    if (err) {
      console.error("Database Error (Deleting Film):", err.message);
      return res.status(500).send("Error deleting film");
    }

    res.redirect("/admin"); // Pastikan URL redirect sesuai
  });
});

module.exports = router;
