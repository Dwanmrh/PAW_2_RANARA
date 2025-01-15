const request = require('supertest');
const express = require('express');
const router = require('../routes/authRoutes'); // Adjust the path to match the location of authRoutes.js
const app = express();

// Use your actual middleware and app setup here
app.use(express.json());
app.use(router);

describe('POST /signup', () => {
  it('should register a new user successfully', async () => {
    const newUser = {
      nama: 'AnggiTAA',
      username: 'anggi123',
      password: 'anggi123',
      email: 'anggi@gmail.com',
      role: 'user', // Optional field
    };

    const response = await request(app)
      .post('/signup')
      .send(newUser);

    expect(response.status).toBe(302); // Checking for redirect to login page
    expect(response.header.location).toBe('/login'); // Redirects to login page
  });

  it('should return 400 if any field is missing', async () => {
    const newUser = {
        nama: 'Anggi Puspita',
        username: 'anggi',
        password: 'anggi123',
      // Email is missing
    };

    const response = await request(app)
      .post('/signup')
      .send(newUser);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Semua kolom wajib diisi.');
  });
});