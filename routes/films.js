const express = require("express");
const multer = require("multer");
const db = require("../database/db");
const path = require("path");
const fs = require("fs");
const router = express.Router();

// Konfigurasi Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images"),
  filename: (req, file, cb) => cb(null, file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error("Only images are allowed"));
};

const upload = multer({ storage, fileFilter });

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
  
    db.query("SELECT * FROM films WHERE id_film = ?", [id], (err, results) => {
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
  
      const oldPicture = results[0].picture;
  
      // Update data di database
      const queryUpdate =
        "UPDATE films SET title = ?, genre = ?, duration = ?, description = ?, picture = ? WHERE id_film = ?";
      db.query(
        queryUpdate,
        [title, genre, duration, description, newPicture || oldPicture, id],
        (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
  
          // Hapus file lama jika ada file baru
          if (newPicture) {
            const filePath = path.join(__dirname, "public/images", oldImage);
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
      if (err) return res.status(500).json({ error: err.message });
      if (results.length === 0)
        return res.status(404).json({ message: "Film tidak ditemukan" });
  
      const pictureName = results[0].picture;
  
      // Hapus file dari folder
      const filePath = path.join(__dirname, "public/images", pictureName);
      fs.unlink(filePath, (err) => {
        if (err) return res.status(500).json({ error: err.message });
  
        // Hapus data dari database
        const queryDelete = "DELETE FROM films WHERE id_film = ?";
        db.query(queryDelete, [id], (err, result) => {
          if (err) return res.status(500).json({ error: err.message });
          res
            .status(200)
            .json({ message: "Film berhasil dihapus", data: result });
        });
      });
    });
  });

module.exports = router;