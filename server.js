// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const apiRoutes = require('./routes/api');
// require('dotenv').config();

// const app = express();
// const connectDB = require('./config/db');

// const corsOptions = {
//   origin: ['http://localhost:3000'], // Specify your front-end URL(s)
//   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
// };

// app.use(cors(corsOptions));


// // Connect to MongoDB
// connectDB().then(() => {
//   console.log("Connected to MongoDB");
// }).catch((error) => {
//   console.error("MongoDB connection error:", error);
// });

// // Middleware
// app.use(cors());
// app.use(express.json());

// // API Routes
// app.use('/api', apiRoutes);

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const connectDB = require('./config/db');

// Connect to MongoDB
connectDB().then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("MongoDB connection error:", error);
});

// CORS Configuration
const corsOptions = {
  origin: '*', // Allow all origins for testing (change this for production)
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
};

app.use(cors(corsOptions));
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).send('Server is healthy');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
