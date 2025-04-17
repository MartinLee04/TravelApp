import mysql from 'mysql';
import config from './config.js';
import fetch from 'node-fetch';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import response from 'express';
import cors from 'cors';
import Amadeus from 'amadeus';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);



const app = express();
app.use(cors()); // Enable CORS
app.use(express.json());

// Increase body parsing limits if needed
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// Serve static files from React (client/build folder)
app.use(express.static(path.join(__dirname, 'client/build')));

// ---------------------- API Endpoints ----------------------
// Load cities with filtering
app.post('/api/loadCities', (req, res) => {
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

// Get all cities
app.get('/api/getAllCities', (req, res) => {
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

// Get all blog posts
app.get('/api/getAllBlogPosts', (req, res) => {
  const connection = mysql.createConnection(config);
  const sql =
    'SELECT blogPosts.*, cities.city_name, cities.country, user_profiles.username ' +
    'FROM blogPosts ' +
    'LEFT JOIN cities ON blogPosts.city_id = cities.city_id ' +
    'LEFT JOIN user_profiles ON blogPosts.account_id = user_profiles.id';

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

// Add new blog post
app.post('/api/addBlogPost', (req, res) => {
  const { account_id, header, rating, body, city_id } = req.body;
  const connection = mysql.createConnection(config);

  connection.query(
    'INSERT INTO blogPosts (account_id, header, rating, body, city_id) VALUES (?, ?, ?, ?, ?)',
    [account_id, header, rating, body, city_id],
    (error, results) => {
      if (error) {
        console.error(error.message);
        return res.status(500).send({ error: 'Failed to insert new blog post' });
      }
      res.json(results);
      connection.end();
    }
  );
});

// Increment city safety score
app.post('/api/updateCityReviewAndSafety', (req, res) => {
  const { city_id, blog_score } = req.body;
  const connection = mysql.createConnection(config);
  
  const sql = 'UPDATE cities SET reviewCount = reviewCount + 1, safety_score = safety_score + ? WHERE city_id = ?';
  
  connection.query(sql, [blog_score, city_id], (error, results) => {
    if (error) {
      return res.status(500).send({ error: 'Database query failed' });
    }
    res.json(results);
    connection.end();
  });
});

///////// Profile State APIs
// Get user info
app.post('/api/getUserInfo', (req, res) => {
  const { username, password} = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM user_profiles WHERE user_profiles.username = ? and user_profiles.password = ?;'
  const values = [username, password];

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

app.post('/api/getUserBlogPosts', (req, res) => {
  const { userid } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM blogPosts WHERE blogPosts.account_id = ?;'
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

app.post('/api/addUserFlight', (req, res) => {
  const { account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'INSERT INTO user_flights (account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency)'+
              'VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);'
  const values = [account_id, origin_code, dep_code, dep_date, ret_date, dep_time, ret_time, segments, price, currency];

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

app.post('/api/getUserFlights', (req, res) => {
  const { account_id } = req.body;
  const connection = mysql.createConnection(config);
  const sql = 'SELECT * FROM user_flights WHERE user_flights.account_id = ?;'
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





/////////////////////// Flight API Amadeus for Developers Connection



const amadeus = new Amadeus({
  clientId: 'GuR8pZSdQ2AWC8mfwAVbOmC8CfST4DLZ',
  clientSecret: '6l8Oyq3iIs2vFSuo'
});


// Get flight information
app.post('/search-flights', async (req, res) => {
  try {
    const { originCode, destinationCode, departureDate, returnDate, maxPrice, currency, adults } = req.body;

    const requestBody = {
      currencyCode: currency,
      originDestinations: [
        {
          id: '1',
          originLocationCode: originCode,
          destinationLocationCode: destinationCode,
          departureDateTimeRange: { date: departureDate },
        },
        {
          id: '2',
          originLocationCode: destinationCode,
          destinationLocationCode: originCode,
          departureDateTimeRange: { date: returnDate },
        }
      ],
      //
      travelers: Array.from({ length: adults }, (_, i) => ({
        id: `${i + 1}`,
        travelerType: 'ADULT',
      })),
      sources: ['GDS'],
      maxPrice: maxPrice,
      searchCriteria: {
        maxFlightOffers: 100
      }
    };

    const response = await amadeus.shopping.flightOffersSearch.post(
      JSON.stringify(requestBody),
      { 'X-HTTP-Method-Override': 'GET' } // Required header for POST requests
    );
    let uniqueFlights = [];
    let prevPrice = 0;
    let flights = response.data
    console.log(flights[5])
    for (let i=0; i< flights.length;i++) {

      if (flights[i].price.total !== prevPrice) {
        uniqueFlights.push(flights[i]);
        prevPrice = flights[i].price.total
      }
    }
    console.log(uniqueFlights)
    res.json(uniqueFlights);
  } catch (error) {
    console.error('Amadeus API Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'An error occurred while fetching flight data' });
  }
});

// Get destination name by airport code

app.post('/search-city', async (req, res) => {
  try {
    const { airportCode } = req.body;

    // Validate input
    if (!airportCode || typeof airportCode !== 'string') {
      return res.status(400).json({ error: 'Invalid or missing airportCode' });
    }

    const response = await amadeus.referenceData.locations.get({
      keyword: airportCode,
      subType: 'CITY,AIRPORT',
      max: 1,
    });

    // Check if data exists and has expected structure
    if (response.data && response.data.length > 0 && response.data[0].address) {
      const cityName = response.data[0].address.cityName;
      res.json({ cityName });
    } else {
      res.status(404).json({ error: 'City not found' });
    }
  } catch (error) {
    console.error('Error fetching city data:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch city data',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// ------------------ Authentication Endpoints ------------------

// Registration endpoint
app.post('/auth/register', (req, res) => {
  const {
    username,
    password,
    first_name,
    last_name,
    email,
    phone_number,
    languages_spoken,
  } = req.body;

  const connection = mysql.createConnection(config);

  connection.connect((err) => {
    if (err) {
      console.error('Connection error:', err);
      return res.status(500).json({ message: 'Database connection error' });
    }

    // Check if the user already exists by username or email
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

        // Store the password as plain text (WARNING: This is insecure)
        connection.query(
          'INSERT INTO user_profiles (username, password, first_name, last_name, email, phone_number, languages_spoken) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            username,
            password,
            first_name,
            last_name,
            email,
            phone_number,
            languages_spoken,
          ],
          (error, results) => {
            connection.end();
            if (error) {
              console.error('Insert error:', error);
              return res.status(500).json({ message: 'Database insert error' });
            }
            return res.status(201).json({ message: 'User registered successfully' });
          }
        );
      }
    );
  });
});

// Login endpoint
app.post('/auth/login', (req, res) => {
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
      (error, results) => {
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
        // Directly compare passwords (WARNING: Storing plain text passwords is insecure)
        if (password !== user.password) {
          connection.end();
          return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        connection.end();
        // Return a simple success response without a token
        return res.json({ message: 'Login successful', userID: user.id });
      }
    );
  });
});

// ------------------ Listen on Specified HOST & PORT ------------------
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5000;

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});

