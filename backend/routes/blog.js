// backend/routes/blog.js
import express from 'express';
import mysql from 'mysql';
import config from '../config/config.js';

const router = express.Router();

// Get all blog posts
router.get('/getAllBlogPosts', (req, res) => {
  const connection = mysql.createConnection(config);
  const sql =
    'SELECT blogPosts.*, travel_destinations.city, travel_destinations.country, user_profiles.username ' +
    'FROM blogPosts ' +
    'LEFT JOIN travel_destinations ON blogPosts.city_id = travel_destinations.destination_id ' +
    'LEFT JOIN user_profiles ON blogPosts.account_id = user_profiles.id';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'OOPSY POOPSY' });
    }
    res.json(results);
    connection.end();
  });
});

// Add new blog post
router.post('/addBlogPost', (req, res) => {
  const { account_id, header, rating, body, city_id } = req.body;
  const connection = mysql.createConnection(config);
  const sql =
    'INSERT INTO blogPosts (account_id, header, rating, body, city_id) VALUES (?, ?, ?, ?, ?)';
  const values = [account_id, header, rating, body, city_id];

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Failed to insert new blog post' });
    }
    res.status(201).json({
      message: 'Blog post created successfully',
      postId: results.insertId,
    });
    connection.end();
  });
});

// Add new delete blog post endpoint
router.delete('/deleteBlogPost/:postId/:userId', (req, res) => {
  const { postId, userId } = req.params;
  const connection = mysql.createConnection(config);
  
  // First check if the post belongs to the user
  connection.query(
    'SELECT account_id FROM blogPosts WHERE post_id = ?',
    [postId],
    (error, results) => {
      if (error) {
        console.error(error.message);
        connection.end();
        return res.status(500).send({ error: 'Failed to check post ownership' });
      }
      
      if (results.length === 0) {
        connection.end();
        return res.status(404).send({ error: 'Blog post not found' });
      }
      
      if (results[0].account_id !== parseInt(userId)) {
        connection.end();
        return res.status(403).send({ error: 'Not authorized to delete this post' });
      }
      
      // If authorized, proceed with deletion
      connection.query(
        'DELETE FROM blogPosts WHERE post_id = ?',
        [postId],
        (deleteError, deleteResults) => {
          if (deleteError) {
            console.error(deleteError.message);
            connection.end();
            return res.status(500).send({ error: 'Failed to delete blog post' });
          }
          
          res.json({ message: 'Blog post deleted successfully' });
          connection.end();
        }
      );
    }
  );
});

/*
router.post('/updateCityReviewAndSafety', (req, res) => {
  console.log("Hello");
  const { city_id, blog_score } = req.body;
  const connection = mysql.createConnection(config);
  console.log()
  
  connection.query(
    'UPDATE cities SET reviewCount = reviewCount + 1, safety_score = safety_score + ? WHERE city_id = ?',
    [blog_score, city_id],
    (error, results) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send({ error: 'Database query failed' });
      }
      res.json(results);
      connection.end();
    }
  );
});
*/

export default router;
