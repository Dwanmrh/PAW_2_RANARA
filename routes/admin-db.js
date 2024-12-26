const express = require("express");
const router = express.Router();
const db = require("../database/db"); // Mengimpor koneksi database

// Endpoint untuk mendapatkan semua Films
router.get("/", (req, res) => {
  db.query("SELECT * FROM films", (err, results) => {
    if (err) return res.status(500).send("Internal Server Error");
    res.json(results);
  });
});

// Endpoint untuk mendapatkan Films berdasarkan ID
router.get("/:id", (req, res) => {
  db.query(
    "SELECT * FROM films WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.length === 0)
        return res.status(404).send("Films tidak ditemukan");
      res.json(results[0]);
    }
  );
});

/// Endpoint untuk menambahkan Films baru
router.post("/film", (req, res) => {
  const { title } = req.body;

  // Cek jika Title kosong
  if (!title || title.trim() === "") {
    return res.status(400).send("Title tidak boleh kosong");
  }

  // Query untuk menambahkan Films baru ke database
  db.query(
    "INSERT INTO films (id_film, id_kursi, id_jadwal, title, genre, duration, description) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [title.trim(), false],
    (err, results) => {
      if (err) {
        console.error("Error inserting title:", err); // Log error untuk debugging
        return res.status(500).send("Internal Server Error");
      }

      const newFilm = {
        id: results.insertId, // Dapatkan ID otomatis
        title: title.trim(),
        genre: "Animation",
        duration: "1j 30m",
        description: "Film Animasi Terbaik 2024",
      };

      // Kembalikan respons dengan data Film yang baru ditambahkan
      res.status(201).json(newFilm);
    }
  );
});

// Endpoint untuk memperbarui Films
router.put("/:id", (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).send("Films tidak boleh kosong");
  }

  db.query(
    "UPDATE films SET title = ? WHERE id = ?",
    [title.trim(), req.params.id],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.affectedRows === 0)
        return res.status(404).send("Films tidak ditemukan");
      res.json({ id: req.params.id, title: title.trim() });
    }
  );
});

// Endpoint untuk menghapus Films
router.delete("/:id", (req, res) => {
  db.query(
    "DELETE FROM films WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.affectedRows === 0)
        return res.status(404).send("Films tidak ditemukan");
      res.status(204).send();
    }
  );
});

router.post("/delete/:id", (req, res) => {
  db.query(
    "DELETE FROM films WHERE id = ?",
    [req.params.id],
    (err, results) => {
      if (err) return res.status(500).send("Internal Server Error");
      if (results.affectedRows === 0)
        return res.status(404).send("Films tidak ditemukan");
      res.redirect("/"); // Redirect setelah berhasil menghapus
    }
  );
});

module.exports = router;
