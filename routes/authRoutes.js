const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();
const path = require("path");
const fs = require("fs");

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images"); // Folder tempat menyimpan file
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Rename file
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });
const crypto = require("crypto");

// Route untuk halaman Awal movie
router.get("/", (req, res) => {
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }
    res.render("movie", {
      layout: "layouts/main-layout",
      films: results,
    });
  });
});

// Route Signup
router.post("/signup", async (req, res) => {
  console.log("Request Body:", req.body);
  const { nama, username, password, email, role } = req.body; // Add role

  // Validasi input
  if (!nama || !username || !password || !email) {
    return res.status(400).send("Semua kolom wajib diisi.");
  }

  try {
    db.query(
      "INSERT INTO users (nama, username, password, email, role) VALUES (?, ?, ?, ?, ?)",
      [nama, username, password, email, role || "user"], // Default role is 'user'
      (err) => {
        if (err) {
          console.error("Database Error (Signup):", err.message);
          return res.status(500).send("Error registering users");
        }
        res.redirect("/login");
      }
    );
  } catch (err) {
    console.error("Error (Signup):", err.message);
    res.status(500).send("Server Error");
  }
});

// Route untuk menampilkan form signup
router.get("/signup", (req, res) => {
  res.render("signup", {
    layout: "layouts/main-layout",
    user: null, // Tidak ada user yang login
  });
});

// Route Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).send("Error fetching user");
      }

      if (results.length === 0) {
        return res.status(400).send("Invalid username or password");
      }

      const user = results[0];

      if (password !== user.password) {
        return res.status(400).send("Invalid username or password");
      }

      req.session.userId = user.id;
      req.session.username = user.username;
      req.session.role = user.role; // Pastikan role diset di sini
      console.log("User Role:", user.role); // Debugging untuk memverifikasi nilai role

      // Pastikan pengecekan role benar
      if (user.role === "admin") {
        return res.redirect("/admin"); // Arahkan ke halaman admin jika admin
      } else {
        return res.redirect("/home"); // Arahkan ke halaman home jika bukan admin
      }
    }
  );
});

// Route untuk menampilkan form login
router.get("/login", (req, res) => {
  res.render("login", {
    layout: "layouts/main-layout",
    successMessage: req.session.successMessage || null,
    user: null,
  });
});

// Route untuk halaman Home
router.get("/home", isAuthenticated, (req, res) => {
  const username = req.session.username;

  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    res.render("home", {
      layout: "layouts/main-layout",
      username,
      films: results,
    });
  });
});

// Route untuk halaman Order
router.get("/order", isAuthenticated, (req, res) => {
  db.query("SELECT title FROM films", (err, films) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    res.render("order", {
      layout: "layouts/main-layout",
      films, // Kirimkan data film ke form sebagai opsi dropdown
      user: req.session.username || null, // Kirimkan username jika user login
    });
  });
});

// Route untuk memproses form Order
router.post("/order", (req, res) => {
  const { title, no_kursi, total_tiket, total_harga } = req.body;
  const id_user = Math.floor(1000 + Math.random() * 9000); // 4 angka acak
  const kode_bk = Math.floor(1000 + Math.random() * 9000); // 4 angka acak
  const currentDate = new Date();
  const date = currentDate.toISOString().split("T")[0]; // Format YYYY-MM-DD
  const time = currentDate.toTimeString().split(" ")[0]; // Format HH:MM:SS

  const query = `
    INSERT INTO pesanan (id_user, kode_bk, total_harga, total_tiket, title, date, time, no_kursi)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [id_user, kode_bk, total_harga, total_tiket, title, date, time, no_kursi],
    (err, results) => {
      if (err) {
        console.error("Database Error (Saving Order):", err.message);
        return res.status(500).send("Error saving order");
      }

      req.session.order = {
        id_user,
        kode_bk,
        total_harga: total_harga * 10,
        total_tiket,
        title,
        date,
        time,
        no_kursi,
      };
      res.redirect("/ticket");
    }
  );
});

// Route untuk halaman Ticket
router.get("/ticket", isAuthenticated, (req, res) => {
  res.render("ticket", {
    layout: "layouts/main-layout",
    user: req.session.username || null, // Kirimkan username jika user login
  });
});

// Route Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/login");
  });
});

module.exports = router;
