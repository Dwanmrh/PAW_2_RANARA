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

// Route untuk halaman awal movie
app.get("/", (req, res) => {
  const sql = "SELECT * FROM films";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error mendapatkan data film:", err);
      return res.status(500).send("Internal Server Error");
    }
    res.render("movie", {
      layout: "layouts/main-layout",
      films: results, // Kirimkan data films ke view
    });
  });
});

// Endpoint untuk mendapatkan semua data film.
app.get("/films", (req, res) => {
  const sql = "SELECT * FROM films";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error mendapatkan film:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
    res.send(results);
  });
});

// Endpoint untuk mendapatkan semua data film by id.
app.get("/films/:id", (req, res) => {
  const { id } = req.params;

  const sql = "SELECT * FROM films WHERE id_film = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error mendapatkan film:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
    if (result.length === 0) {
      return res.status(404).send({ error: "Film tidak ditemukan" });
    }
    res.send(result[0]);
  });
});

// Konfigurasi multer untuk upload file
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/"); // Direktori tempat gambar disimpan
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Penamaan unik
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/; // Hanya format tertentu yang diperbolehkan
    const isValidExt = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const isValidMime = allowedTypes.test(file.mimetype);

    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Hanya file gambar dengan format JPEG, JPG, atau PNG yang diperbolehkan!"
        )
      );
    }
  },
});

// Endpoint untuk menambahkan film dengan gambar
app.post("/add/films", upload.single("picture"), (req, res) => {
  const {
    id_kursi,
    title,
    genre,
    duration,
    description,
    picture: pictureInput,
  } = req.body;
  const picture = req.file ? req.file.filename : pictureInput; // Gunakan file upload atau input Postman

  // Hasilkan id_jadwal secara otomatis
  const id_jadwal = Math.floor(100 + Math.random() * 900).toString(); // Tiga digit angka acak

  if (!id_kursi || !title || !genre || !duration || !description) {
    return res.status(400).send({ error: "Semua kolom harus diisi!" });
  }

  if (!picture) {
    return res
      .status(400)
      .send({ error: "Gambar atau nama gambar harus disediakan!" });
  }

  const sql = `
    INSERT INTO films (id_kursi, id_jadwal, title, genre, duration, description, picture)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    id_kursi,
    id_jadwal,
    title,
    genre,
    duration,
    description,
    picture,
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error menambahkan film:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
    res.status(201).send({
      message: "Film berhasil ditambahkan!",
      id: result.insertId,
      id_jadwal: id_jadwal, // Sertakan id_jadwal yang dihasilkan
    });
  });
});

// Endpoint untuk memperbarui data film berdasarkan id.
app.put("/films/:id", upload.single("picture"), (req, res) => {
  const { id } = req.params;
  const { id_kursi, id_jadwal, title, genre, duration, description } = req.body;
  const picture = req.file ? req.file.filename : null;

  if (
    !id_kursi ||
    !id_jadwal ||
    !title ||
    !genre ||
    !duration ||
    !description
  ) {
    return res.status(400).send({ error: "Semua kolom harus diisi!" });
  }

  // Ambil data gambar lama jika tidak ada file baru yang diunggah
  const getPictureSql = "SELECT picture FROM films WHERE id_film = ?";
  db.query(getPictureSql, [id], (err, results) => {
    if (err) {
      console.error("Error mengambil data gambar lama:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).send({ error: "Film tidak ditemukan" });
    }

    const oldPicture = results[0].picture;
    const newPicture = picture || oldPicture;

    // Lanjutkan dengan pembaruan data
    const updateSql = `
      UPDATE films
      SET id_kursi = ?, id_jadwal = ?, title = ?, genre = ?, duration = ?, description = ?, picture = ?
      WHERE id_film = ?
    `;
    const values = [
      id_kursi,
      id_jadwal,
      title,
      genre,
      duration,
      description,
      newPicture,
      id,
    ];

    db.query(updateSql, values, (err, result) => {
      if (err) {
        console.error("Error memperbarui film:", err);
        return res.status(500).send({ error: "Internal Server Error" });
      }

      if (result.affectedRows === 0) {
        return res.status(404).send({ error: "Film tidak ditemukan" });
      }

      res.send({ message: "Film berhasil diperbarui!" });
    });
  });
});

// Endpoint untuk menghapus data film berdasarkan id.
app.delete("/films/:id", (req, res) => {
  const { id } = req.params;

  const sql = "DELETE FROM films WHERE id_film = ?";
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error("Error menghapus film:", err);
      return res.status(500).send({ error: "Internal Server Error" });
    }
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Film tidak ditemukan" });
    }
    res.send({ message: "Film berhasil dihapus!" });
  });
});

// Konfigurasi port
const port = process.env.PORT || 3000;

// Middleware
app.use(expressLayout);

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
app.use(express.static(path.join(__dirname, "public")));

// Mengatur view engine menjadi EJS
app.set("view engine", "ejs");

app.set("layout", "main-layout"); // Atur layout default

// Routes
app.use("/", authRoutes); // Rute autentikasi

// Route untuk halaman Login
app.get("/login", (req, res) => {
  res.render("login", { layout: false }); // Tanpa layout
});

// Route untuk halaman Signup
app.get("/signup", (req, res) => {
  res.render("signup", { layout: false }); // Tanpa layout
});

// Route untuk halaman Home
app.get("/home", isAuthenticated, (req, res) => {
  res.render("home", {
    layout: "layouts/main-layout",
    username: req.session.user ? req.session.user.username : "User", // Ambil username dari session
  });
});

// Route halaman admin
app.get("/admin", isAuthenticated, (req, res) => {
  db.query("SELECT * FROM films", (err, film) => {
    if (err) {
      console.error("Database Error:", err.message); // Debugging
      return res.status(500).send("Internal Server Error");
    }
    res.render("films", {
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
