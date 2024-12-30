const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const expressLayout = require("express-ejs-layouts");
const authRoutes = require("./routes/authRoutes");
const { isAuthenticated } = require("./middlewares/middleware.js");
const db = require("./database/db");
const multer = require("multer");
const path = require("path");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Konfigurasi session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Middleware tambahan
app.use(expressLayout);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.userId; // True jika userId ada di session
  res.locals.currentPath = req.path; // Menyimpan path saat ini
  next();
});

app.set("view engine", "ejs");
app.set("layout", "main-layout");

// Tambahkan routes
app.use("/", authRoutes);

// Penanganan 404
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Konfigurasi port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}/`);
});
