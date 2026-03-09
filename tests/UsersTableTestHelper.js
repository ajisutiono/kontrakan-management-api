/* istanbul ignore file */
import pool from '../src/Infrastructures/database/postgres/pool';

const UsersTableTestHelper = {
  async addUser({
    id = 'user-123',
    name = 'Test User',
    email = 'test@example.com',
    password = 'hashed_password',
    role = 'tenant',
  } = {}) {
    const query = {
      text: `INSERT INTO users (id, name, email, password, role)
                    VALUES ($1, $2, $3, $4, $5)`,
      values: [id, name, email, password, role],
    };

    await pool.query(query);
  },

  async findUserById(id) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [id],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findUserByEmail(email) {
    const query = {
      text: 'SELECT * FROM users WHERE email = $1',
      values: [email],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE users');
  },
};

export default UsersTableTestHelper;