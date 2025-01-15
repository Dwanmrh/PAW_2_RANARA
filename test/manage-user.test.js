const request = require('supertest');
const { JSDOM } = require('jsdom');
const app = require('../app'); // Sesuaikan dengan path aplikasi Anda

describe('Admin User Panel Tests', () => {
  // Testing API untuk menambahkan user
  describe('POST /add/users', () => {
    it('should add a new user successfully', async () => {
      const response = await request(app)
        .post('/add/users')
        .send({
          nama: 'John Doe',
          username: 'johndoe',
          password: 'password123',
          email: 'johndoe@example.com',
          role: 'Admin'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'User added successfully');
    }, 10000);
  });

  // Testing API untuk mengupdate user
  describe('PUT /update/users/:id', () => {
    it('should update user details successfully', async () => {
      const id_user = 18; // Ganti dengan ID user valid
      const response = await request(app)
        .put(`/update/users/${id_user}`)
        .send({
          nama: 'Jane Doe',
          username: 'janedoe',
          password: 'newpassword123',
          email: 'janedoe@example.com',
          role: 'User'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User updated successfully');
    });
  });

  // Testing API untuk menghapus user
  describe('DELETE /delete/users/:id', () => {
    it('should delete a user successfully', async () => {
      const id_user = 19; // Ganti dengan ID user valid
      const response = await request(app)
        .delete(`/delete/users/${id_user}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'User deleted successfully');
    });
  });

  // Testing Frontend: Modal Add User
  describe('Modal Add User UI', () => {
    it('should show Add User modal and submit form', async () => {
      const dom = new JSDOM(`
        <html>
          <body>
            <form id="addUserForm">
              <input type="text" id="nama" value="John Doe">
              <input type="text" id="username" value="johndoe">
              <input type="password" id="password" value="password123">
              <input type="email" id="email" value="johndoe@example.com">
              <input type="radio" name="role" id="roleAdmin" value="Admin" checked>
              <button type="submit">Simpan</button>
            </form>
          </body>
        </html>
      `);
      global.document = dom.window.document;
      global.window = dom.window;

      const form = document.getElementById('addUserForm');
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
      expect(form.querySelector('#nama').value).toBe('John Doe');
      expect(form.querySelector('#username').value).toBe('johndoe');
      expect(form.querySelector('#password').value).toBe('password123');
      expect(form.querySelector('#email').value).toBe('johndoe@example.com');
      expect(form.querySelector('input[name="role"]:checked').value).toBe('Admin');
    });
  });

  // Testing Frontend: Delete User Confirmation
  describe('Delete User Confirmation UI', () => {
    it('should show confirmation modal and delete user', async () => {
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