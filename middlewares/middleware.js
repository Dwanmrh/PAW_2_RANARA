// Middleware untuk memeriksa autentikasi
function isAuthenticated(req, res, next) {
    if (!req.session.username) {
      // Jika tidak ada username dalam session, arahkan ke login
      return res.redirect("/login");
    }
    next();
  }
  
  module.exports = { isAuthenticated };
  