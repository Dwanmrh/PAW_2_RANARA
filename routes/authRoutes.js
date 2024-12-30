const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();

// Konfigurasi penyimpanan Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder tempat menyimpan file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});

// Filter untuk memastikan hanya file gambar yang diupload
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

// Route untuk halaman Awal movie
router.get("/", isAuthenticated, (req, res) => {
  const username = req.session.username; // Ambil username dari session

  // Query database untuk mengambil daftar film
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    // Pastikan data film dikirim ke view
    res.render("movie", {
      layout: "layouts/main-layout",
      username, // Kirimkan username ke view
      films: results, // Kirimkan daftar film ke view
    });
  });
});

// Route untuk menambahkan film
router.post("/add/films", upload.single("picture"), (req, res) => {
  const { title, genre, duration, description } = req.body;
  const picture = req.file ? fs.readFileSync(req.file.path) : null;

  db.query(
    "INSERT INTO films (title, genre, duration, description, picture) VALUES (?, ?, ?, ?, ?)",
    [title, genre, duration, description, picture],
    (err) => {
      if (err) {
        console.error("Database Error (Adding Film):", err.message);
        return res.status(500).send("Error adding film");
      }
      res.redirect("/home");
    }
  );
});

// Route Signup
router.post("/signup", async (req, res) => {
  const { nama, username, password, email } = req.body;

  try {
    db.query(
      "INSERT INTO users (nama, username, password, email) VALUES (?, ?, ?, ?)",
      [nama, username, password, email],
      (err) => {
        if (err) {
          console.error("Database Error (Signup):", err.message);
          return res.status(500).send("Error registering users");
        }
        res.redirect("/login"); // Arahkan ke halaman login
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

  // Cari user berdasarkan username
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) {
        console.error("Database Error:", err.message);
        return res.status(500).send("Error fetching user");
      }

      // Jika user tidak ditemukan
      if (results.length === 0) {
        return res.status(400).send("Invalid username or password");
      }

      const user = results[0];

      // Bandingkan password input dengan password di database
      if (password !== user.password) {
        return res.status(400).send("Invalid username or password");
      }

      // Jika username dan password cocok
      req.session.userId = user.id; // Simpan ID user ke session
      req.session.username = user.username; // Simpan username ke session
      res.redirect("/home"); // Redirect ke halaman utama
    }
  );
});

// Route untuk menampilkan form login
router.get("/login", (req, res) => {
  res.render("login", {
    layout: "layouts/main-layout",
    successMessage: req.session.successMessage || null,
    user: null, // Tidak ada user yang login
  });
});

// Route untuk halaman Home
router.get("/home", isAuthenticated, (req, res) => {
  const username = req.session.username; // Ambil username dari session

  // Query database untuk mengambil daftar film
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).send("Error fetching films");
    }

    // Pastikan data film dikirim ke view
    res.render("home", {
      layout: "layouts/main-layout",
      username, // Kirimkan username ke view
      films: results, // Kirimkan daftar film ke view
    });
  });
});

// Route Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/login"); // Arahkan ke halaman login setelah logout
  });
});

module.exports = router;
