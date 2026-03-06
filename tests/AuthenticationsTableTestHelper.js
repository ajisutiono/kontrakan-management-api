import pool from '../src/Infrastructures/database/postgres/pool';

const AuthenticationsTableTestHelper = {
  async addToken({
    id = 'auth-123',
    token = 'refresh_token_sample',
    userId = 'user-123',
  } = {}) {
    const query = {
      text: `INSERT INTO authentications (id, token, user_id)
                    VALUES ($1, $2, $3)`,
      values: [id, token, userId],
    };

    await pool.query(query);
  },

  async findToken(token) {
    const query = {
      text: 'SELECT * FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await pool.query(query);
    return result.rows[0];
  },

  async findTokenByUserId(userId) {
    const query = {
      text: 'SELECT * FROM authentications WHERE user_id = $1',
      values: [userId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('TRUNCATE TABLE authentications');
  },

};

export default AuthenticationsTableTestHelper;