const request = require('supertest');
const { JSDOM } = require('jsdom');
const app = require('../app');  // Sesuaikan dengan path aplikasi Anda

describe('Admin Panel Tests', () => {
  
// Testing API untuk mengupdate film
describe('PUT /update/films/:id', () => {
  it('should update film details successfully', async () => {
    const id_films = 25;  // Pastikan ini adalah ID film yang valid
    const response = await request(app)
      .put(`/update/films/${id_films}`)
      .field('title', 'UTUSAN IBLIS')
      .field('genre', 'Horor')
      .field('duration', '2j 30m')
      .field('description', 'Olivia, seorang psikiater, membantu polisi Rendy menyelidiki kasus pembantaian yang dilakukan Cantika. Seiring penyelidikan, Olivia mulai terpengaruh oleh kejadian aneh yang mengungkap luka masa lalunya, dan menyadari bahwa ia berinteraksi dengan sesuatu dalam dirinya, bukan Cantika.')
      .attach('picture', './public/images/utusan-iblis.jpg');  // Kirimkan gambar seperti saat menambahkan film
  
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Film berhasil diperbarui');
  });
});

});
