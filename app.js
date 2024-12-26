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

// Built-in Middleware
app.use(express.static("public"));

// Mengatur view engine menjadi EJS
app.set("view engine", "ejs");

// Routes
app.use("/film", adminRoutes); // Rute untuk film
app.use("/", authRoutes); // Rute autentikasi

// Route untuk halaman utama (Login)
app.get("/", (req, res) => {
  res.render("login", { layout: "layouts/main-layout" });
});

// Route untuk halaman Home
app.get("/home", isAuthenticated, (req, res) => {
  res.render("home", { layout: "layouts/main-layout" });
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

// Endpoint untuk mendapatkan data tabel users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, results) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.json(results);
    }
  });
});

// CREATE: Tambah film baru
app.post("/films", (req, res) => {
  const { id_kursi, id_jadwal, title, genre, duration, description } = req.body;
  const sql =
    "INSERT INTO films (id_kursi, id_jadwal, title, genre, duration, description) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [id_kursi, id_jadwal, title, genre, duration, description],
    (err, result) => {
      if (err) {
        console.error("Error inserting film:", err);
        res.status(500).send("Internal Server Error");
      } else {
        res.status(201).json({
          id_film: result.insertId,
          id_kursi,
          id_jadwal,
          title,
          genre,
          duration,
          description,
        });
      }
    }
  );
});

// READ: Ambil semua film
app.get("/films", (req, res) => {
  const sql = "SELECT * FROM films";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching films:", err);
      res.status(500).send("Internal Server Error");
    } else {
      res.json(results);
    }
  });
});

// READ: Ambil film berdasarkan ID
app.get("/films/:id_film", (req, res) => {
  const { id_film } = req.params;
  const sql = "SELECT * FROM films WHERE id_film = ?";
  db.query(sql, [id_film], (err, results) => {
    if (err) {
      console.error("Error fetching film:", err);
      res.status(500).send("Internal Server Error");
    } else if (results.length === 0) {
      res.status(404).send("Film not found");
    } else {
      res.json(results[0]);
    }
  });
});

// UPDATE: Update data film
app.put("/films/:id_film", (req, res) => {
  const { id_film } = req.params;
  const { id_kursi, id_jadwal, title, genre, duration, description } = req.body;
  const sql =
    "UPDATE films SET id_kursi = ?, id_jadwal = ?, title = ?, genre = ?, duration = ?, description = ? WHERE id_film = ?";
  db.query(
    sql,
    [id_kursi, id_jadwal, title, genre, duration, description, id_film],
    (err, result) => {
      if (err) {
        console.error("Error updating film:", err);
        res.status(500).send("Internal Server Error");
      } else if (result.affectedRows === 0) {
        res.status(404).send("Film not found");
      } else {
        res.json({
          id_film,
          id_kursi,
          id_jadwal,
          title,
          genre,
          duration,
          description,
        });
      }
    }
  );
});

// DELETE: Hapus film
app.delete("/films/:id_film", (req, res) => {
  const { id_film } = req.params;
  const sql = "DELETE FROM films WHERE id_film = ?";
  db.query(sql, [id_film], (err, result) => {
    if (err) {
      console.error("Error deleting film:", err);
      res.status(500).send("Internal Server Error");
    } else if (result.affectedRows === 0) {
      res.status(404).send("Film not found");
    } else {
      res.sendStatus(204);
    }
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
