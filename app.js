const express = require("express");
const app = express();
require("dotenv").config();
const session = require("express-session");
const expressLayout = require("express-ejs-layouts");
const adminRoutes = require("./routes/admin-db.js");
const authRoutes = require("./routes/authRoutes");
const { isAuthenticated } = require("./middlewares/middleware.js");
const db = require("./database/db");

// Konfigurasi port
const port = process.env.PORT || 3000;

// Middleware
app.use(expressLayout);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  })
);

// Middleware untuk memberikan informasi user dan path saat ini
app.use((req, res, next) => {
  res.locals.currentPath = req.path; // Path saat ini
  res.locals.isLoggedIn = !!req.session.username; // Menggunakan username yang konsisten
  res.locals.userName = req.session.username || null; // Tambahkan username ke res.locals
  next();
});


// Built-in Middleware
app.use(express.static("public"));

// Mengatur view engine menjadi EJS
app.set("view engine", "ejs");

// Routes
app.use("/film", adminRoutes); // Rute untuk film
app.use("/", authRoutes); // Rute autentikasi

// Route untuk halaman utama (Movie)
app.get("/", (req, res) => {
  const sql = "SELECT * FROM films";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching films:", err);
      return res.status(500).send("Internal Server Error");
    }
    // Kirim data films ke view
    res.render("movie", { layout: "layouts/main-layout", films: results });
  });
});

// Route untuk halaman Login
app.get('/login', (req, res) => {
  res.render('login', { layout: false }); // Tanpa layout
});

// Route untuk halaman Signup
app.get('/signup', (req, res) => {
  res.render('signup', { layout: false }); // Tanpa layout
});

// Route untuk halaman Home
app.get("/home", isAuthenticated, (req, res) => {
  res.render("home", {
    layout: "layouts/main-layout",
    username: req.session.user ? req.session.user.username : 'User', // Ambil username dari session
  });
});


// Route halaman admin
app.get("/admin", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM film", (err, film) => {
    if (err) {
      console.error("Database Error:", err.message); // Debugging
      return res.status(500).send("Internal Server Error");
    }
    res.render("film", {
      layout: "layouts/main-layout",
      films: film, // Kirimkan data film ke view
    });
  });
});

// Penanganan 404 untuk rute yang tidak ditemukan
app.use((req, res) => {
  res.status(404).send("404 - Page Not Found");
});

// Memulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}/`);
});
