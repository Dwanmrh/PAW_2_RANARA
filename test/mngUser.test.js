const request = require('supertest');
const app = require('../app'); // Sesuaikan dengan path aplikasi Anda

describe('Testing API untuk mengupdate user', () => {
  describe('PUT /update/users/:id', () => {
    it('should update user details successfully', async () => {
      const id_user = 5; // Pastikan ini adalah ID user yang valid dalam database Anda
      const response = await request(app)
        .put(`/update/users/${id_user}`)
        .send({
          nama: 'John Doe',
          username: 'johndoe',
          password: 'jh12345',
          email: 'john.doe@example.com',
          role: 'Admin' // Bisa 'Admin' atau 'User'
        });

      // Log full response for debugging
      console.log('Response:', response.body);

      // Assertions
      expect(response.status).toBe(200); // Mengharapkan status 200 OK
      expect(response.body).toHaveProperty('message', 'User berhasil diperbarui'); // Memeriksa pesan sukses
    });
  });
});
