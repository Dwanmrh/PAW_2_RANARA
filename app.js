const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const expressLayout = require("express-ejs-layouts");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require('./routes/admin.js');
const userRoutes = require("./routes/users.js");
const { isAuthenticated } = require("./middlewares/middleware.js");
const db = require("./database/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Middleware parsing JSON dan form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Ubah ke `true` jika menggunakan HTTPS
  })
);

// Middleware tambahan
app.use(expressLayout);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.username; // True jika username ada di session
  res.locals.currentPath = req.path; // Menyimpan path saat ini
  res.locals.role = req.session.role;
  next();
});

// Pengaturan view engine
app.set("view engine", "ejs");
app.set("layout", "layouts/main-layout");

// Tambahkan routes
app.use("/", authRoutes); // Rute autentikasi (login, logout, dll.)
app.use("/admin", isAuthenticated, adminRoutes); // Rute admin dengan middleware autentikasi
app.use("/user", isAuthenticated, userRoutes); // Rute user dengan middleware autentikasi

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Folder tempat menyimpan file
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Rename file
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });

// Penanganan 404
app.use((req, res) => {
  res.status(404).render("404", { title: "404 - Page Not Found" });
});

// Konfigurasi port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}/`);
});
