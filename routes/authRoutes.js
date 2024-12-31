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
    cb(null, "public/images/"); // Folder tempat menyimpan file
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

// <<-- CRUD FILM -->> //
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
  const { id_film } = req.params;

  db.query("SELECT * FROM films WHERE id_film = ?", [id_film], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Film):", err.message);
      return res.status(500).json({ error: "Error fetching film" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Film not found" });
    }
    res.status(200).json(results[0]);
  });
});

// Route untuk Add Film
router.post("/add/films", upload.single("picture"), (req, res) => {
  const { title, genre, duration, description } = req.body;
  const picture = req.file ? `public/images/${req.file.filename}` : null;

  if (!title || !genre || !duration || !description || !picture) {
    return res.status(400).json({ error: "All fields are required" });
  }

  db.query(
    "INSERT INTO films (title, genre, duration, description, picture) VALUES (?, ?, ?, ?, ?)",
    [title, genre, duration, description, picture],
    (err) => {
      if (err) {
        console.error("Database Error (Adding Film):", err.message);
        return res.status(500).json({ error: "Error adding film" });
      }
      res.status(201).json({ message: "Film added successfully" });
    }
  );
});

// Route untuk Update Film
router.put("/update/films/:id", upload.single("picture"), (req, res) => {
  const { id } = req.params;
  const { title, genre, duration, description } = req.body;
  const picture = req.file ? `public/images/${req.file.filename}` : null;

  db.query(
    "UPDATE films SET title = ?, genre = ?, duration = ?, description = ?, picture = ? WHERE id_film = ?",
    [title, genre, duration, description, picture, id],
    (err) => {
      if (err) {
        console.error("Database Error (Updating Film):", err.message);
        return res.status(500).json({ error: "Error updating film" });
      }
      res.status(200).json({ message: "Film updated successfully" });
    }
  );
});

// Route untuk Delete Film
router.delete("/delete/films/:id", (req, res) => {
  const { id } = req.params;

  db.query("DELETE FROM films WHERE id_film = ?", [id], (err) => {
    if (err) {
      console.error("Database Error (Deleting Film):", err.message);
      return res.status(500).json({ error: "Error deleting film" });
    }
    res.status(200).json({ message: "Film deleted successfully" });
  });
});
// <<-- AKHIR CRUD FILM -->> //

// <<-- CRUD KURSI -->> //
// Route untuk Get All Kursi
router.get("/kursi/:id_film", (req, res) => {
  const { id_film } = req.params;

  db.query("SELECT * FROM kursi WHERE id_film = ?", [id_film], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Seats):", err.message);
      return res.status(500).json({ error: "Error fetching seats" });
    }
    res.json(results);
  });
});

// Route untuk Get Kursi By ID
router.get("/kursi/:id", (req, res) => {
  const { id_kursi } = req.params;
  db.query("SELECT * FROM kursi WHERE id_kursi = ?", [id_kursi], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Seat):", err.message);
      return res.status(500).json({ error: "Error fetching seat" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Seat not found" });
    }
    res.json(results[0]);
  });
});

// Route untuk Add Kursi
router.post("/add/kursi", (req, res) => {
  const { id_tiket, no_kursi, status = "Dipesan", id_film} = req.body;

  if (!no_kursi || !id_film) {
    return res.status(400).json({ error: "Nomor kursi and ID Film are required" });
  }

  db.query(
    "INSERT INTO kursi (id_tiket, no_kursi, status) VALUES (?, ?, ?, ?)",
    [id_film, id_tiket, no_kursi, status],
    (err, results) => {
      if (err) {
        console.error("Database Error (Adding Seat):", err.message);
        return res.status(500).json({ error: "Error adding seat" });
      }
      res.status(201).json({ message: "Seat added successfully", id: results.insertId });
    }
  );
});

// Route untuk Update Kursi
router.put("/update/kursi/:id", (req, res) => {
  const { id_kursi } = req.params;
  const { id_film, id_tiket, no_kursi, status } = req.body;

  db.query(
    "UPDATE kursi SET id_film = ?, id_tiket = ?, no_kursi = ?, status = ? WHERE id_kursi = ?",
    [id_film, id_tiket, no_kursi, status],
    (err, results) => {
      if (err) {
        console.error("Database Error (Updating Seat):", err.message);
        return res.status(500).json({ error: "Error updating seat" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Seat not found" });
      }
      res.json({ message: "Seat updated successfully" });
    }
  );
});

// Route untuk Delete Kursi
router.delete("/delete/kursi/:id", (req, res) => {
  const { id_kursi } = req.params;

  db.query("DELETE FROM kursi WHERE id_kursi = ?", [id_kursi], (err, results) => {
    if (err) {
      console.error("Database Error (Deleting Seat):", err.message);
      return res.status(500).json({ error: "Error deleting seat" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Seat not found" });
    }
    res.json({ message: "Seat deleted successfully" });
  });
});
// <<-- AKHIR CRUD KURSI -->> //

// <<-- CRUD JADWAL -->> //
// Route untuk Get All Jadwal
router.get("/jadwal/:id_film", (req, res) => {
  const { id_film } = req.params;

  db.query("SELECT * FROM jadwal WHERE id_film = ?", [id_film], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Schedule):", err.message);
      return res.status(500).json({ error: "Error fetching schedule" });
    }
    res.status(200).json(results);
  });
});

// Route untuk Get Jadwal By ID
router.get("/jadwal/:id", (req, res) => {
  const { id_jadwal } = req.params;
  db.query("SELECT * FROM jadwal WHERE id_jadwal = ?", [id_jadwal], (err, results) => {
    if (err) {
      console.error("Database Error (Fetching Seat):", err.message);
      return res.status(500).json({ error: "Error fetching schedule" });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json(results[0]);
  });
});

// Route untuk Add Jadwal
router.post("/add/jadwal", (req, res) => {
  const { id_film, id_tiket, date, time } = req.body;

  // Validasi input
  if (!date || !time || !id_film) {
    return res.status(400).json({ error: "Date, Time, and ID Film are required" });
  }

  // Format validasi tanggal
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format YYYY-MM-DD
  const timeRegex = /^\d{2}:\d{2}:\d{2}$/; // Format HH:MM:SS

  if (!dateRegex.test(date)) {
    return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD" });
  }

  if (!timeRegex.test(time)) {
    return res.status(400).json({ error: "Invalid time format. Use HH:MM:SS" });
  }

  db.query(
    "INSERT INTO jadwal (id_film, id_tiket, date, time) VALUES (?, ?, ?, ?)",
    [id_film, id_tiket, date, time],
    (err, results) => {
      if (err) {
        console.error("Database Error (Adding Schedule):", err.message);
        return res.status(500).json({ error: "Error adding schedule" });
      }
      res.status(201).json({ message: "Schedule added successfully", id: results.insertId });
    }
  );
});

// Route untuk Update Jadwal
router.put("/update/jadwal/:id", (req, res) => {
  const { id_jadwal } = req.params;
  const { id_film, id_tiket, date, time } = req.body;

  db.query(
    "UPDATE jadwal SET id_film = ?, id_tiket = ?, date = ?, time = ? WHERE id_jadwal = ?",
    [id_film, id_tiket, date, time],
    (err, results) => {
      if (err) {
        console.error("Database Error (Updating Schedule):", err.message);
        return res.status(500).json({ error: "Error updating schedule" });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Schedule not found" });
      }
      res.json({ message: "Schedule updated successfully" });
    }
  );
});

// Route untuk Delete Jadwal
router.delete("/delete/jadwal/:id", (req, res) => {
  const { id_jadwal } = req.params;

  db.query("DELETE FROM jadwal WHERE id_jadwal = ?", [id_jadwal], (err, results) => {
    if (err) {
      console.error("Database Error (Deleting Schedule):", err.message);
      return res.status(500).json({ error: "Error deleting schedule" });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Schedule not found" });
    }
    res.json({ message: "Schedule deleted successfully" });
  });
});
// <<-- AKHIR CRUD JADWAL -->> //

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
        no_kursi
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