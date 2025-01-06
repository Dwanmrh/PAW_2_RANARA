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

// <<- CRUD FILM ->> //
// Route untuk Get All Film
router.get("/films", (req, res) => {
  db.query("SELECT * FROM films", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Films):", err.message);
      return res.status(500).json({ error: "Error fetching films" });
    }
    res.status(200).json(results);
  });
});

// Route untuk Get All Film By ID
router.get("/films/:id", (req, res) => {
  const { id } = req.params;
  console.log("Fetching film with ID:", id);

  db.query("SELECT * FROM films WHERE id_film = ?", [id], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Film):", err.message);
      return res.status(500).json({ error: "Error fetching film" });
    }
    if (results.length === 0) {
      console.log("Film not found for ID:", id);
      return res.status(404).json({ error: "Film not found" });
    }
    console.log("Film data fetched:", results[0]);
    res.status(200).json(results[0]);
  });
});

// Route untuk Add Film
router.post("/add/films", upload.single("picture"), (req, res) => {
  const { title, genre, duration, description } = req.body;
  const picture = req.file.originalname;

  if (!title || !genre || !duration || !description || !picture) {
    return res
      .status(400)
      .json({ error: "All fields and an image are required" });
  }

  const sql =
    "INSERT INTO films (title, genre, duration, description, picture) VALUES (?, ?, ?, ?, ?)";
  db.query(
    sql,
    [title, genre, duration, description, picture],
    (err, result) => {
      if (err) {
        console.error("Database Error (Adding Film):", err.message);
        return res.status(500).json({ error: "Error adding film" });
      }
      res
        .status(201)
        .json({ message: "Film added successfully!", id: result.insertId });
    }
  );
});

// Route untuk Update Film
router.put("/update/films/:id", upload.single("picture"), (req, res) => {
  const { id } = req.params;
  const { title, genre, duration, description } = req.body;
  const newPicture = req.file ? req.file.originalname : null;

  // Ambil data lama
  const querySelect = "SELECT picture FROM films WHERE id_film = ?";
  db.query(querySelect, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0)
      return res.status(404).json({ message: "Film tidak ditemukan" });

    // Update data di database
    const queryUpdate =
      "UPDATE films SET title = ?, genre = ?, duration = ?, description = ?, picture = ? WHERE id_film = ?";
    db.query(
      queryUpdate,
      [title, genre, duration, description, newPicture, id],
      (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        // Hapus file lama jika ada file baru
        if (newPicture) {
          const filePath = path.join(__dirname, "public/images");
          fs.unlink(filePath, (err) => {
            if (err) console.error("Gagal menghapus file lama:", err.message);
          });
        }

        res
          .status(200)
          .json({ message: "Film berhasil diperbarui", data: result });
      }
    );
  });
});

// Route untuk Delete Film
router.delete("/delete/films/:id", (req, res) => {
  const { id } = req.params;

  // Ambil nama file dari database
  const querySelect = "SELECT picture FROM films WHERE id_film = ?";
  db.query(querySelect, [id], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Film):", err.message);
      return res.status(500).json({ error: "Error fetching film data" });
    }
    if (results.length === 0) {
      console.log("Film not found for ID:", id);
      return res.status(404).json({ message: "Film tidak ditemukan" });
    }

    const pictureName = results[0].picture;

    // Hapus file dari folder jika ada
    if (pictureName) {
      const filePath = path.join(__dirname, "public/images", pictureName);
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err.message);
          // Lanjutkan proses penghapusan dari database meskipun file tidak bisa dihapus
        }
      });
    }

    // Hapus data dari database
    const queryDelete = "DELETE FROM films WHERE id_film = ?";
    db.query(queryDelete, [id], (err, result) => {
      if (err) {
        console.error("Database Error (Deleting Film):", err.message);
        return res.status(500).json({ error: "Error deleting film" });
      }

      if (result.affectedRows === 0) {
        console.log("No rows affected during delete for ID:", id);
        return res.status(404).json({ message: "Film tidak ditemukan" });
      }

      res.status(200).json({ message: "Film berhasil dihapus", data: result });
    });
  });
});
// <<- AKHIR CRUD FILM ->> //

// <<- CRUD PESANAN ->> //
// Route untuk Get Pesanan
router.get("/pesanan", (req, res) => {
  db.query("SELECT * FROM pesanan", (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Pesanan):", err.message);
      return res.status(500).json({ error: "Error fetching pesanan" });
    }
    res.status(200).json(results);
  });
});

// Route untuk Get Pesanan By ID
router.get("/pesanan/:id", (req, res) => {
  const { id } = req.params;
  console.log("Fetching pesanan with ID:", id);

  db.query(
    "SELECT * FROM pesanan WHERE id_pesanan = ?",
    [id],
    (err, results) => {
      if (err) {
        console.error("Database Error (Fetching Pesanan):", err.message);
        return res.status(500).json({ error: "Error fetching pesanan" });
      }
      if (results.length === 0) {
        console.log("Pesanan not found for ID:", id);
        return res.status(404).json({ error: "Pesanan not found" });
      }
      console.log("Pesanan data fetched:", results[0]);
      res.status(200).json(results[0]);
    }
  );
});

// Route untuk Create Pesanan
router.post("/add/pesanan", (req, res) => {
  const { total_harga, total_tiket, title, date, time, no_kursi } = req.body;

  const kode_bk = `CODE${Math.random()
    .toString(36)
    .substr(2, 6)
    .toUpperCase()}`;

  if (!total_harga || !total_tiket || !title || !date || !time || !no_kursi) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const sql =
    "INSERT INTO pesanan (kode_bk, total_harga, total_tiket, title, date, time, no_kursi) VALUES (?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [kode_bk, total_harga, total_tiket, title, date, time, no_kursi],
    (err, result) => {
      if (err) {
        console.error("Database Error (Adding Pesanan):", err.message);
        return res.status(500).json({ error: "Error adding pesanan" });
      }
      res
        .status(201)
        .json({ message: "Pesanan added successfully!", id: result.insertId });
    }
  );
});

// Route untuk Update Pesanan
router.put("/update/pesanan/:id", (req, res) => {
  const { id } = req.params;
  const { total_harga, total_tiket, title, date, time, no_kursi } = req.body;

  // Validasi input
  if (!total_harga || !total_tiket || !title || !date || !time || !no_kursi) {
    return res.status(400).json({ error: "All fields are required" });
  }

  // Ambil data lama untuk memastikan pesanan ada
  const querySelect = "SELECT * FROM pesanan WHERE id_pesanan = ?";
  db.query(querySelect, [id], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Pesanan):", err.message);
      return res.status(500).json({ error: "Error fetching pesanan" });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Pesanan tidak ditemukan" });
    }

    // Update data di database
    const queryUpdate =
      "UPDATE pesanan SET total_harga = ?, total_tiket = ?, title = ?, date = ?, time = ?, no_kursi = ? WHERE id_pesanan = ?";
    db.query(
      queryUpdate,
      [total_harga, total_tiket, title, date, time, no_kursi, id],
      (err, result) => {
        if (err) {
          console.error("Database Error (Updating Pesanan):", err.message);
          return res.status(500).json({ error: "Error updating pesanan" });
        }

        res
          .status(200)
          .json({ message: "Pesanan berhasil diperbarui", data: result });
      }
    );
  });
});

// Route untuk Delete Pesanan
router.delete("/delete/pesanan/:id", (req, res) => {
  const { id } = req.params;

  // Ambil nama file dari database
  const querySelect = "SELECT picture FROM films WHERE id_film = ?";
  db.query(querySelect, [id], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Film):", err.message);
      return res.status(500).json({ error: "Error fetching film data" });
    }
    if (results.length === 0) {
      console.log("Film not found for ID:", id);
      return res.status(404).json({ message: "Film tidak ditemukan" });
    }

    // Hapus data dari database
    const queryDelete = "DELETE FROM films WHERE id_film = ?";
    db.query(queryDelete, [id], (err, result) => {
      if (err) {
        console.error("Database Error (Deleting Film):", err.message);
        return res.status(500).json({ error: "Error deleting film" });
      }

      if (result.affectedRows === 0) {
        console.log("No rows affected during delete for ID:", id);
        return res.status(404).json({ message: "Film tidak ditemukan" });
      }

      res.status(200).json({ message: "Film berhasil dihapus", data: result });
    });
  });
});
// <<- AKHIR CRUD PESANAN ->> //

// <<- CRUD TIKET ->> //


// <<- AKHIR CRUD TIKET ->> //

// <<- CRUD TRANSAKSI ->> //

// <<- AKHIR CRUD TRANSAKSI ->> //

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