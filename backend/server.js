// backend/server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

// Import routes
import citiesRoutes from './routes/cities.js';
import blogRoutes from './routes/blog.js';
import userRoutes from './routes/user.js';
import flightsRoutes from './routes/flights.js';
import authRoutes from './routes/auth.js';
import infoRoutes from './routes/info.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// Serve static files (React build)
app.use(express.static(path.join(__dirname, '../client/build')));

// Use API routes
app.use('/api', citiesRoutes);
app.use('/api', blogRoutes);
app.use('/api', userRoutes);
app.use('/', flightsRoutes);
app.use('/auth', authRoutes);
app.use('/info', infoRoutes);

// Start the server
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT || 5001; //change this to 5000
app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
