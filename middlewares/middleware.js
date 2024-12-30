const db = require("../database/db"); // Koneksi database

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
