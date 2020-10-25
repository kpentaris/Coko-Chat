const {Pool} = require('pg');

/**
 * DB Connection pool
 *
 * @type {PG.Pool}
 */
const pool = new Pool({
  user: 'postgres',
  password: 'mysecretpassword', // should not be here obviously
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

/**
 * Retrieves all available users
 *
 * @returns {Promise<*>}
 */
async function getAllUsers() {
  return (await pool.query('SELECT * FROM USERS')).rows;
}

/**
 * Insert new message into the database.
 *
 * @param msg
 * @returns {Promise<*>}
 */
async function insertMessage(msg) {
  const query = `INSERT INTO MESSAGES 
    (MESSAGE_TEXT, CREATED_ON, FROM_USER${!!msg.mention_user_id ? ', MENTION_USER_ID' : ''})
    VALUES ($1, $2, $3${!!msg.mention_user_id ? ', $4' : ''})
    RETURNING ID
  `;
  const params = [msg.message_text, msg.created_on, msg.from_user];
  if(!!msg.mention_user_id)
    params.push(msg.mention_user_id);
  return (await pool.query(query, params)).rows;
}

/**
 * Retrieve all available messages of the chatroom.
 *
 * @returns {Promise<*>}
 */
async function getMessages() {
  return (await pool.query('SELECT * FROM MESSAGES')).rows;
}

module.exports = {
  insertMessage, getAllUsers, getMessages
};
