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

// Route untuk Get All Kursi
router.get("/kursi/:id_film", (req, res) => {
    const { id_film } = req.params;
  
    db.query(
      "SELECT * FROM kursi WHERE id_film = ?",
      [id_film],
      (err, results) => {
        if (err) {
          console.error("Database Error (Fetching Seats):", err.message);
          return res.status(500).json({ error: "Error fetching seats" });
        }
        res.json(results);
      }
    );
  });
  
  // Route untuk Get Kursi By ID
  router.get("/kursi/:id", (req, res) => {
    const { id_kursi } = req.params;
    db.query(
      "SELECT * FROM kursi WHERE id_kursi = ?",
      [id_kursi],
      (err, results) => {
        if (err) {
          console.error("Database Error (Fetching Seat):", err.message);
          return res.status(500).json({ error: "Error fetching seat" });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: "Seat not found" });
        }
        res.json(results[0]);
      }
    );
  });
  
  // Route untuk Add Kursi
  router.post("/add/kursi", (req, res) => {
    const { id_tiket, no_kursi, status = "Dipesan", id_film } = req.body;
  
    if (!no_kursi || !id_film) {
      return res
        .status(400)
        .json({ error: "Nomor kursi and ID Film are required" });
    }
  
    db.query(
      "INSERT INTO kursi (id_tiket, no_kursi, status) VALUES (?, ?, ?, ?)",
      [id_film, id_tiket, no_kursi, status],
      (err, results) => {
        if (err) {
          console.error("Database Error (Adding Seat):", err.message);
          return res.status(500).json({ error: "Error adding seat" });
        }
        res
          .status(201)
          .json({ message: "Seat added successfully", id: results.insertId });
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
  
    db.query(
      "DELETE FROM kursi WHERE id_kursi = ?",
      [id_kursi],
      (err, results) => {
        if (err) {
          console.error("Database Error (Deleting Seat):", err.message);
          return res.status(500).json({ error: "Error deleting seat" });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Seat not found" });
        }
        res.json({ message: "Seat deleted successfully" });
      }
    );
  });

  module.exports = router;