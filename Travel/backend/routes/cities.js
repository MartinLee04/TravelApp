// backend/routes/cities.js
import express from 'express';
import mysql from 'mysql';
import config from '../config/config.js';

const router = express.Router();

// Load cities with filtering
router.post('/loadCities', (req, res) => {
  console.log('Received:', req.body);

  const connection = mysql.createConnection(config);
  const { country, continent, languages_spoken, temperature, daily_living_cost, safety_score } = req.body;

  let sql = 'SELECT * FROM cities WHERE 1=1';
  const data = [];

  if (country) {
    sql += ' AND country = ?';
    data.push(country);
  }
  if (continent) {
    sql += ' AND continent = ?';
    data.push(continent);
  }
  if (languages_spoken) {
    sql += ' AND languages_spoken LIKE ?';
    data.push(`%${languages_spoken}%`);
  }
  if (temperature) {
    sql += ' AND temperature = ?';
    data.push(temperature);
  }
  if (daily_living_cost) {
    sql += ' AND daily_living_cost = ?';
    data.push(daily_living_cost);
  }
  if (safety_score) {
    sql += ' AND safety_score >= ?';
    data.push(safety_score);
  }

  connection.query(sql, data, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.send({ express: JSON.stringify(results) });
    connection.end();
  });
});

/*
// Get all cities
router.get('/getAllCities', (req, res) => {
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM cities';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});
*/

// Get all cities
router.get('/getTravelDestinations', (req, res) => {
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM travel_destinations';

  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    console.log(results);
    connection.end();
  });
});

// Get all travel destinations with current month data
router.get('/getCurentTravelDestinations', (req, res) => {
  const connection = mysql.createConnection(config);
  
  // Get current month (0-11, where 0 is January)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  const sql = 'SELECT * FROM travel_destinations';
  
  connection.query(sql, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    
    // Process results to ensure array fields are properly formatted
    const processedResults = results.map(dest => {
      // Handle airport_codes field
      try {
        if (typeof dest.airport_codes === 'string') {
          dest.airport_codes = JSON.parse(dest.airport_codes.replace(/'/g, '"'));
        }
      } catch (e) {
        console.warn('Error parsing airport_codes:', e);
        // Fallback parsing if JSON.parse fails
        if (typeof dest.airport_codes === 'string') {
          dest.airport_codes = dest.airport_codes.replace(/[\[\]']/g, '').split(', ');
        }
      }
      
      // Handle hotel_prices field
      try {
        if (typeof dest.hotel_prices === 'string') {
          dest.hotel_prices = JSON.parse(dest.hotel_prices.replace(/'/g, '"'));
        }
        // Add current month's price as a separate field for convenience
        dest.current_price = Array.isArray(dest.hotel_prices) ? 
          dest.hotel_prices[currentMonth] : dest.hotel_prices;
      } catch (e) {
        console.warn('Error parsing hotel_prices:', e);
        if (typeof dest.hotel_prices === 'string') {
          dest.hotel_prices = dest.hotel_prices.replace(/[\[\]']/g, '').split(', ').map(Number);
          dest.current_price = dest.hotel_prices[currentMonth];
        }
      }
      
      // Handle avg_monthly_temps field
      try {
        if (typeof dest.avg_monthly_temps === 'string') {
          dest.avg_monthly_temps = JSON.parse(dest.avg_monthly_temps.replace(/'/g, '"'));
        }
        // Add current month's temperature as a separate field for convenience
        dest.current_temp = Array.isArray(dest.avg_monthly_temps) ? 
          dest.avg_monthly_temps[currentMonth] : dest.avg_monthly_temps;
      } catch (e) {
        console.warn('Error parsing avg_monthly_temps:', e);
        if (typeof dest.avg_monthly_temps === 'string') {
          dest.avg_monthly_temps = dest.avg_monthly_temps.replace(/[\[\]']/g, '').split(', ').map(Number);
          dest.current_temp = dest.avg_monthly_temps[currentMonth];
        }
      }
      
      return dest;
    });
    
    res.json(processedResults);
    connection.end();
  });
});

// Add a filtered version of the endpoint for better query performance
router.post('/getFilteredDestinations', (req, res) => {
  const connection = mysql.createConnection(config);
  const { country, language, minSafety, minPrice, maxPrice, minTemp, maxTemp } = req.body;
  
  // Get current month (0-11, where 0 is January)
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  
  let sql = 'SELECT * FROM travel_destinations WHERE 1=1';
  const params = [];
  
  if (country) {
    sql += ' AND country = ?';
    params.push(country);
  }
  
  if (language) {
    sql += ' AND language = ?';
    params.push(language);
  }
  
  if (minSafety) {
    sql += ' AND safety_score >= ?';
    params.push(minSafety);
  }
  
  connection.query(sql, params, (error, results) => {
    if (error) {
      console.error(error.message);
      connection.end();
      return res.status(500).send({ error: 'Database query failed' });
    }
    
    // Post-process the results to filter by monthly data
    const processedResults = results
      .map(dest => {
        // Parse arrays if needed
        let hotelPrices = dest.hotel_prices;
        let temperatures = dest.avg_monthly_temps;
        
        if (typeof hotelPrices === 'string') {
          try {
            hotelPrices = JSON.parse(hotelPrices.replace(/'/g, '"'));
          } catch {
            hotelPrices = hotelPrices.replace(/[\[\]']/g, '').split(', ').map(Number);
          }
        }
        
        if (typeof temperatures === 'string') {
          try {
            temperatures = JSON.parse(temperatures.replace(/'/g, '"'));
          } catch {
            temperatures = temperatures.replace(/[\[\]']/g, '').split(', ').map(Number);
          }
        }
        
        // Add current month's values
        dest.current_price = Array.isArray(hotelPrices) ? hotelPrices[currentMonth] : null;
        dest.current_temp = Array.isArray(temperatures) ? temperatures[currentMonth] : null;
        
        return dest;
      })
      .filter(dest => {
        // Apply filters that depend on the monthly data
        return (
          (!minPrice || dest.current_price >= minPrice) &&
          (!maxPrice || dest.current_price <= maxPrice) &&
          (!minTemp || dest.current_temp >= minTemp) &&
          (!maxTemp || dest.current_temp <= maxTemp)
        );
      });
    
    res.json(processedResults);
    connection.end();
  });
});

export default router;
