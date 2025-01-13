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
  
  // Testing API untuk mengupdate film
// Testing API untuk mengupdate film
describe('Testing API untuk mengupdate film', () => {
  describe('PUT /update/films/:id', () => {
    it('should update film details successfully', async () => {
      const id_film = 10;  // Pastikan ini adalah ID film yang valid dalam database Anda
      const response = await request(app)
        .put(`/update/films/${id_film}`)
        .field('title', 'MOANA1')
        .field('genre', 'Horor')
        .field('duration', '1j 30m')
        .field('description', 'Olivia, seoranodeng psikiater, membantu polisi Rendy menyelidiki kasus pembantaian yang dilakukan Cantika.')
        .attach('picture', './public/images/utusan-iblis.jpeg');  // Kirimkan gambar seperti saat menambahkan film

      // Log full response for debugging
      console.log('Response:', response.body);

      // Assertions
      expect(response.status).toBe(200);  // Mengharapkan status 200 OK
      expect(response.body).toHaveProperty('message', 'Film berhasil diperbarui');  // Memeriksa pesan sukses
    });
  });
});


  
  // Testing API untuk menghapus film
  describe('DELETE /delete/films/:id', () => {
    it('should delete a film successfully', async () => {
      const id_films = 15;  // Ganti dengan ID film yang ada di database
      const response = await request(app)
        .delete(`/delete/films/${id_films}`);
  
      expect(response.status).toBe(200); // Status yang diharapkan
      expect(response.body).toHaveProperty('message', 'Film berhasil dihapus');
    });
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

  // Testing Frontend: Modal Edit Film
  describe('Modal Edit Film UI', () => {
    it('should show Edit Film modal and submit form', async () => {
      const dom = new JSDOM(`
        <html>
          <body>
            <form id="editFilmForm">
              <input type="text" id="editTitle" value="UTUSAN IBLIS">
              <input type="text" id="editGenre" value="Horor">
              <input type="text" id="editDuration" value="1j 30m">
              <textarea id="editDescription">Olivia, seorang psikiater, membantu polisi Rendy menyelidiki kasus pembantaian yang dilakukan Cantika. Seiring penyelidikan, Olivia mulai terpengaruh oleh kejadian aneh yang mengungkap luka masa lalunya, dan menyadari bahwa ia berinteraksi dengan sesuatu dalam dirinya, bukan Cantika.</textarea>
              <input type="file" id="editPicture" />
              <button type="submit">Update</button>
            </form>
          </body>
        </html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      const form = document.getElementById('editFilmForm');
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
      expect(form.querySelector('#editTitle').value).toBe('UTUSAN IBLIS');
      expect(form.querySelector('#editGenre').value).toBe('Horor');
      expect(form.querySelector('#editDuration').value).toBe('1j 30m');
      expect(form.querySelector('#editDescription').value).toBe('Olivia, seorang psikiater, membantu polisi Rendy menyelidiki kasus pembantaian yang dilakukan Cantika. Seiring penyelidikan, Olivia mulai terpengaruh oleh kejadian aneh yang mengungkap luka masa lalunya, dan menyadari bahwa ia berinteraksi dengan sesuatu dalam dirinya, bukan Cantika.');
    });
  });

  // Testing Frontend: Deleting Film (Confirm Delete Modal)
  describe('Delete Film Confirmation UI', () => {
    it('should show confirmation modal and delete film', async () => {
      const dom = new JSDOM(`
        <html>
          <body>
            <div id="confirmDeleteModal">
              <button id="confirmDeleteBtn">Ya</button>
            </div>
          </body>
        </html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

      // Simulate button click to delete
      await new Promise(resolve => {
        confirmDeleteBtn.onclick = () => resolve();
        confirmDeleteBtn.click();
      });

      // Check if confirmation action was triggered
      expect(confirmDeleteBtn).toBeTruthy();
    });
  });

});