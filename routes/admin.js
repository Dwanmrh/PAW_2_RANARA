const express = require("express");
const router = express.Router();

// Simulasi data films
let films = [
  {
    id: 1,
    title: "Moana 2",
    genre: "Animation",
    duration: "1j 30m",
    description: "Film Animasi Terbaik 2024",
  },
  {
    id: 2,
    title: "Wrick",
    genre: "Animation",
    duration: "1j 20m",
    description: "Film Fantasi Terbaik 2024",
  },
];

// GET semua films
router.get("/", (req, res) => {
  res.json(films);
});

// POST untuk menambahkan films baru
router.post("/add/film", (req, res) => {
  const { title } = req.body;

  // Validasi input
  if (!title) {
    return res.status(400).json({ message: "Title tidak boleh kosong" });
  }

  const newFilms = {
    id: films.length + 1,
    title: title,
    genre: "Animation",
    duration: "1j 30m",
    description: "Film Animasi Terbaik",
  };

  films.push(newFilms);
  res.status(201).json(newFilms);
});

// GET Films berdasarkan ID
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  const film = films.find((f) => f.id === id);

  if (film) {
    res.json(film);
  } else {
    res.status(404).json({ message: "Films tidak ditemukan" });
  }
});

// DELETE Films berdasarkan ID
router.delete("/:id", (req, res) => {
  const filmIndex = films.findIndex((f) => f.id === parseInt(req.params.id));

  // Jika Films tidak ditemukan
  if (filmIndex === -1) {
    return res.status(404).json({ message: "Film tidak ditemukan" });
  }

  // Menghapus Film dan mengembalikan data yang dihapus
  const deletedFilm = films.splice(filmIndex, 1)[0];
  res
    .status(200)
    .json({ message: `Films'${deletedFilm.title}'berhasil dihapus` });
});

router.put("/:id", (req, res) => {
  const film = films.find((f) => f.id === parseInt(req.params.id));
  if (!film) return res.status(404).json({ message: "Films tidak ditemukan" });
  film.title = req.body.title || film.title;

  res.status(200).json({
    message: `Film dengan ID ${film.id} telah diperbarui`,
    updatedFilm: film,
  });
});

module.exports = router;
