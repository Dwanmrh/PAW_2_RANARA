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

// Route untuk Get All Jadwal
router.get("/jadwal/:id_film", (req, res) => {
    const { id_film } = req.params;
  
    db.query(
      "SELECT * FROM jadwal WHERE id_film = ?",
      [id_film],
      (err, results) => {
        if (err) {
          console.error("Database Error (Fetching Schedule):", err.message);
          return res.status(500).json({ error: "Error fetching schedule" });
        }
        res.status(200).json(results);
      }
    );
  });
  
  // Route untuk Get Jadwal By ID
  router.get("/jadwal/:id", (req, res) => {
    const { id_jadwal } = req.params;
    db.query(
      "SELECT * FROM jadwal WHERE id_jadwal = ?",
      [id_jadwal],
      (err, results) => {
        if (err) {
          console.error("Database Error (Fetching Seat):", err.message);
          return res.status(500).json({ error: "Error fetching schedule" });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Schedule not found" });
        }
        res.json(results[0]);
      }
    );
  });
  
  // Route untuk Add Jadwal
  router.post("/add/jadwal", (req, res) => {
    const { id_film, id_tiket, date, time } = req.body;
  
    // Validasi input
    if (!date || !time || !id_film) {
      return res
        .status(400)
        .json({ error: "Date, Time, and ID Film are required" });
    }
  
    // Format validasi tanggal
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // Format YYYY-MM-DD
    const timeRegex = /^\d{2}:\d{2}:\d{2}$/; // Format HH:MM:SS
  
    if (!dateRegex.test(date)) {
      return res
        .status(400)
        .json({ error: "Invalid date format. Use YYYY-MM-DD" });
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
        res
          .status(201)
          .json({ message: "Schedule added successfully", id: results.insertId });
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
  
    db.query(
      "DELETE FROM jadwal WHERE id_jadwal = ?",
      [id_jadwal],
      (err, results) => {
        if (err) {
          console.error("Database Error (Deleting Schedule):", err.message);
          return res.status(500).json({ error: "Error deleting schedule" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Schedule not found" });
        }
        res.json({ message: "Schedule deleted successfully" });
      }
    );
  });

module.exports = router;