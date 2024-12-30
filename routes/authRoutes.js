const express = require("express");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const db = require("../database/db");
const { isAuthenticated } = require("../middlewares/middleware");
const router = express.Router();
const path = require("path");
const fs = require("fs");

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

// Route untuk mengambil semua data film
router.get("/films", (req, res) => {
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).json({ error: "Error fetching films" });
    }
    res.json(results); // Kirimkan data sebagai JSON
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
  const { nama, username, password, email, role } = req.body; // Add role

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
      req.session.role = user.role;  // Pastikan role diset di sini
      console.log("User Role:", user.role); // Debugging untuk memverifikasi nilai role


      // Pastikan pengecekan role benar
      if (user.role === "admin") {
        return res.redirect("/admin");  // Arahkan ke halaman admin jika admin
      } else {
        return res.redirect("/home");  // Arahkan ke halaman home jika bukan admin
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

// Route Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Error logging out");
    res.redirect("/login");
  });
});

module.exports = router;