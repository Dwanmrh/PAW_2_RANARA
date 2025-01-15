const db = require("../database/db"); // Koneksi database

const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images")); // Folder penyimpanan
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Gunakan nama asli file
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb("Error: Images Only!");
    }
  },
});

module.exports = upload;

// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
  if (!req.session.username) {
    // Jika tidak ada username dalam session, arahkan ke login
    return res.redirect("/login");
  }
  next();
}

// Middleware untuk memeriksa role admin
function isAdmin(req, res, next) {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  // Ambil role dari database berdasarkan username di session
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0 || results[0].role !== "admin") {
      // Jika bukan admin, arahkan ke halaman home atau user
      return res.redirect("/home");
    }

    next();
  });
}

// Middleware untuk memeriksa role user
function isUser(req, res, next) {
  if (!req.session.username) {
    return res.redirect("/login");
  }

  // Ambil role dari database berdasarkan username di session
  const query = "SELECT role FROM users WHERE username = ?";
  db.query(query, [req.session.username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Terjadi kesalahan server.");
    }

    if (results.length === 0 || results[0].role !== "user") {
      // Jika bukan user, arahkan ke halaman homeadmin atau admin
      return res.redirect("/admin");
    }

    next();
  });
}

module.exports = { isAuthenticated, isAdmin, isUser };
