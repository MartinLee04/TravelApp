// backend/routes/user.js
import express from 'express';
import mysql from 'mysql';
import config from '../config/config.js';

const router = express.Router();

// Get user info
router.post('/getUserInfo', (req, res) => {
  const { username } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM user_profiles WHERE username = ?';
  const values = [username];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

router.post('/getUserInfoById', (req, res) => {
  const { userid } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM user_profiles WHERE id = ?';
  const values = [userid];

  console.log("api call", userid)

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

// Get user blog posts
router.post('/getUserBlogPosts', (req, res) => {
  const { userid } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM blogPosts WHERE account_id = ?';
  const values = [userid];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

// Add a user flight
router.post('/addUserFlight', (req, res) => {
  const { account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency } = req.body;
  
  // Validate required fields
  if (!account_id || !origin_code || !dep_code || !dep_date || !dep_time || !segments || !price || !currency) {
    return res.status(400).send({ error: 'Missing required fields' });
  }
  
  const connection = mysql.createConnection(config);
  const sql = 'INSERT INTO user_flights (account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  const values = [account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error('Error saving flight:', error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    console.log('Flight saved successfully for user ID:', account_id);
    res.json({ success: true, flight_id: results.insertId });
    connection.end();
  });
});

// Get user flights
router.post('/getUserFlights', (req, res) => {
  const { account_id } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM user_flights WHERE account_id = ?';
  const values = [account_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

// update user preferences
router.post('/updatePreferences', (req, res) => {
  const { ss, temp, urban, hp, preferred_airport, account_id } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'UPDATE user_profiles SET safety_score = ?, temp = ?, urban = ?, hotel_price = ?, preferred_airport = ? WHERE id = ?;';
  const values = [ss, temp, urban, hp, preferred_airport, account_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

// update user profile information
router.post('/updateUserProfile', (req, res) => {
  const { id, username, email, first_name, last_name, phone_number, languages_spoken } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'UPDATE user_profiles SET username = ?, email = ?, first_name = ?, last_name = ?, phone_number = ?, languages_spoken = ? WHERE id = ?';
  const values = [username, email, first_name, last_name, phone_number, languages_spoken, id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

export default router;
