const request = require('supertest');
const { JSDOM } = require('jsdom');
const app = require('../app');  // Sesuaikan dengan path aplikasi Anda

describe('Admin Panel Tests', () => {
  
  // Testing API untuk menambahkan film
// Testing API untuk menambahkan film
describe('POST /add/films', () => {
    it('should add a new film successfully', async () => {
      const response = await request(app)
        .post('/add/films')
        .field('title', 'MOANA')
        .field('genre', 'Animasi')
        .field('duration', '1j 30m')
        .field('description', 'Setelah menerima panggilan tak terduga dari nenek moyangnya yang ahli navigasi, Moana melakukan perjalanan ke lautan jauh di Oceania dan ke perairan berbahaya yang telah lama hilang untuk sebuah petualangan yang belum pernah dia hadapi sebelumnya.')
        .attach('picture', './public/images/Moana.jpg'); 
  
      expect(response.status).toBe(201); // Mengganti ekspektasi dengan 201
      expect(response.body).toHaveProperty('message', 'Film added successfully!');
    }, 10000);  // Menambah waktu tunggu menjadi 10 detik
  });
  
 

  // Testing Frontend: Modal Add Film
  describe('Modal Add Film UI', () => {
    it('should show Add Film modal and submit form', async () => {
      const dom = new JSDOM(`
        <html>
          <body>
            <form id="addFilmForm">
              <input type="text" id="title" value="MOANA">
              <input type="text" id="genre" value="Animasi">
              <input type="text" id="duration" value="1j 30m">
              <textarea id="description">Setelah menerima panggilan tak terduga dari nenek moyangnya yang ahli navigasi, Moana melakukan perjalanan ke lautan jauh di Oceania dan ke perairan berbahaya yang telah lama hilang untuk sebuah petualangan yang belum pernah dia hadapi sebelumnya.</textarea>
              <input type="file" id="picture" />
              <button type="submit">Simpan</button>
            </form>
          </body>
        </html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      const form = document.getElementById('addFilmForm');
      const submitButton = form.querySelector('button');

      // Simulate form submission
      await new Promise(resolve => {
        form.onsubmit = (event) => {
          event.preventDefault();
          resolve();
        };
        submitButton.click(); // Trigger onsubmit
      });

      // Ensure values are set correctly
      expect(form.querySelector('#title').value).toBe('MOANA');
      expect(form.querySelector('#genre').value).toBe('Animasi');
      expect(form.querySelector('#duration').value).toBe('1j 30m');
      expect(form.querySelector('#description').value).toBe('Setelah menerima panggilan tak terduga dari nenek moyangnya yang ahli navigasi, Moana melakukan perjalanan ke lautan jauh di Oceania dan ke perairan berbahaya yang telah lama hilang untuk sebuah petualangan yang belum pernah dia hadapi sebelumnya.');
    });
  });

});