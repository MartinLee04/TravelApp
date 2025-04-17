// backend/routes/auth.js
import express from 'express';
import mysql from 'mysql';
import config from '../config/config.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();

// Registration endpoint
router.post('/register', (req, res) => {
  const { username, password, first_name, last_name, email, phone_number, languages_spoken } = req.body;
  const connection = mysql.createConnection(config);

  connection.connect((err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ message: 'Database connection error' });
    }
    // Check if user already exists
    connection.query(
      'SELECT * FROM user_profiles WHERE username = ? OR email = ?',
      [username, email],
      (error, results) => {
        if (error) {
          console.error('Query error:', error);
          connection.end();
          return res.status(500).json({ message: 'Database query error' });
        }
        if (results.length > 0) {
          connection.end();
          return res.status(400).json({ message: 'User already exists' });
        }
        // Insert new user (storing plain text passwords is insecure)
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            connection.end();
            return res.status(500).json({ message: 'Error hashing password' });
          }
          connection.query(
            'INSERT INTO user_profiles (username, password, first_name, last_name, email, phone_number, languages_spoken) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [username, hashedPassword, first_name, last_name, email, phone_number, languages_spoken],
            (error, results) => {
              connection.end();
              if (error) {
                console.error('Insert error:', error);
                return res.status(500).json({ message: 'Database insert error' });
              }
              return res.status(201).json({ message: 'User registered successfully' });
            }
          );
        });
      }
    );
  });
});

// Login endpoint
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const connection = mysql.createConnection(config);

  connection.connect((err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Look for the user by username
    connection.query(
      'SELECT * FROM user_profiles WHERE username = ?',
      [username],
      async (error, results) => {
        if (error) {
          console.error('Query error:', error);
          connection.end();
          return res.status(500).json({ message: 'Database query error' });
        }
        if (results.length === 0) {
          connection.end();
          return res.status(404).json({ message: 'User not found' });
        }

        const user = results[0];
        try {
          // **Change 2:** Compare the provided password with the hashed password.
          const isMatch = await bcrypt.compare(password, user.password);
          console.log(isMatch)
          if (!isMatch) {
            connection.end();
            return res.status(401).json({ message: 'Invalid credentials' });
          }

          // Generate a JWT token for the user.
          const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
          );

          connection.end();

          // Return the token along with user information.
          return res.json({ token, message: 'Login successful', userID: user.id });
        } catch (compareError) {
          connection.end();
          console.error('Password comparison error:', compareError);
          return res.status(500).json({ message: 'Error comparing passwords' });
        }
      }
    );
  });
});

export default router;
