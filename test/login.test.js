const request = require("supertest");
const app = require("../app"); // Import aplikasi utama Express
const db = require("../database/db");


beforeAll(async () => {
  // Setup database dengan user ji
  await new Promise((resolve, reject) => {
    db.query(
      "INSERT INTO users (nama, username, password, email, role) VALUES (?, ?, ?, ?, ?)",
      ["anggi puspita", "Anggi123", "anggi12", "anggipuspita303@gmail.com", "user"],
      (err) => {
        if (err) return reject(err);
        resolve();
      }
    );
  });
});

afterAll(async () => {
  // Hapus user setelah pengujian selesai
  await new Promise((resolve, reject) => {
    db.query("DELETE FROM users WHERE username = ?", ["Anggi123"], (err) => {
      if (err) return reject(err);
      resolve();
    });
  });

  db.end(); // Tutup koneksi database
});

describe("POST /login", () => {
  it("should login successfully with valid credentials", async () => {
    const response = await request(app).post("/login").send({
      username: "Anggi123",
      password: "anggi12",
    });

    expect(response.status).toBe(302);
    expect(response.headers.location).toBe("/home");
  });

  it("should return 400 for invalid username or password", async () => {
    const response = await request(app).post("/login").send({
      username: "usernameWrong",
      password: "PasswordWrong",
    });

    expect(response.status).toBe(400);
    expect(response.text).toContain("Invalid username or password");
  });

  it("should return 400 if username or password is missing", async () => {
    const response = await request(app).post("/login").send({
      username: "",
      password: "",
    });

    expect(response.status).toBe(400);
    expect(response.text).toContain("Invalid username or password");
  });
});