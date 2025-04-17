// Get standard infos 
import express from 'express';
import mysql from 'mysql';
import config from '../config/config.js';

const router = express.Router();
// Get languages of each destination
router.post('/getLanguages', (req, res) => {
    const connection = mysql.createConnection(config);
    const sql = 'SELECT DISTINCT language FROM travel_destinations';
    
    connection.query(sql, (error, results) => {
        if (error) {
            console.error('Error executing query:', error);
            res.status(500).json({ error: 'Database query failed' });
        } else {
            // Extract languages from results
            const languages = results.map(result => result.language);
            
            // Send the languages as response
            res.json({ languages });
        }
    });
    
    // Close the connection after query
    connection.end();
});

export default router;

