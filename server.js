const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(cors({
  origin: 'https://codevibesyou.netlify.app',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// Test Route to Verify Server is Running
app.get('/', (req, res) => {
  console.log('Received request for /');
  res.json({ message: 'Server is running!' });
});

// Test Route to Verify API Routes
app.get('/api/test', (req, res) => {
  console.log('Received request for /api/test');
  res.json({ message: 'API routes are working!' });
});

// PostgreSQL Connection
console.log('Setting up PostgreSQL connection...');
const pool = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.database,
  password: process.env.password,
  port: process.env.port,
  ssl: {
    require: true,
    rejectUnauthorized: false
  }
});

pool.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err.stack);
  } else {
    console.log('Connected to database successfully');
  }
});

// Test Database Connection with a Simple Query
pool.query('SELECT NOW()', (err, result) => {
  if (err) {
    console.error('Initial database query failed:', err.stack);
  } else {
    console.log('Initial database query successful:', result.rows);
  }
});

// Nodemailer Setup
console.log('Setting up Nodemailer...');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Validate input
const validateUserInput = (data, isReview = false, isSignup = false) => {
  const errors = {};
  if (!data.name || data.name.length < 2) errors.name = 'Name must be at least 2 characters';
  if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) errors.email = 'Valid email is required';
  if (!data.phone || !/^\+?\d{10,15}$/.test(data.phone)) errors.phone = 'Valid phone number is required';
  if (!data.country) errors.country = 'Country is required';
  if (isSignup && (!data.password || data.password.length < 6)) errors.password = 'Password must be at least 6 characters';
  if (!isReview && !isSignup && (!data.message || data.message.length < 10)) errors.message = 'Message must be at least 10 characters';
  if (isReview && (!data.comment || data.comment.length < 10)) errors.comment = 'Review must be at least 10 characters';
  return errors;
};

// Routes
// Signup
app.post('/api/signup', async (req, res) => {
  console.log('Received request for /api/signup');
  const { name, email, phone, country, password } = req.body;
  const errors = validateUserInput({ name, email, phone, country, password }, false, true);
  if (Object.keys(errors).length) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ errors });
  }
  try {
    console.log('Checking if email exists:', email);
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      console.log('Email already registered:', email);
      return res.status(400).json({ error: 'Email already registered' });
    }
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Password hashed successfully');
    console.log('Inserting user into database...');
    await pool.query(
      'INSERT INTO users (name, email, phone, country, password, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [name, email, phone, country, hashedPassword]
    );
    console.log('User inserted into database:', name);
    console.log('Sending signup email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New User Signup: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}`
    });
    console.log('Signup email sent to:', process.env.EMAIL_USER);
    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  console.log('Received request for /api/projects');
  try {
    console.log('Executing query to fetch projects...');
    const result = await pool.query('SELECT * FROM projects ORDER BY id');
    console.log('Projects fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  console.log('Received request for /api/reviews');
  try {
    console.log('Executing query to fetch reviews...');
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    console.log('Reviews fetched:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post a review
app.post('/api/reviews', async (req, res) => {
  console.log('Received request for /api/reviews');
  const { name, email, phone, country, comment } = req.body;
  const errors = validateUserInput({ name, email, phone, country, comment }, true);
  if (Object.keys(errors).length) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ errors });
  }
  try {
    console.log('Inserting review into database...');
    const result = await pool.query(
      'INSERT INTO reviews (name, email, phone, country, comment, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, email, phone, country, comment]
    );
    console.log('Review inserted:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post contact form
app.post('/api/contact', async (req, res) => {
  console.log('Received request for /api/contact');
  const { name, email, phone, country, message } = req.body;
  const errors = validateUserInput({ name, email, phone, country, message });
  if (Object.keys(errors).length) {
    console.log('Validation errors:', errors);
    return res.status(400).json({ errors });
  }
  try {
    console.log('Inserting contact message into database...');
    await pool.query(
      'INSERT INTO contacts (name, email, phone, country, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [name, email, phone, country, message]
    );
    console.log('Contact message inserted:', name);
    console.log('Sending contact email...');
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\nMessage: ${message}`
    });
    console.log('Contact email sent to:', process.env.EMAIL_USER);
    res.json({ message: 'Message saved and email sent' });
  } catch (err) {
    console.error('Error processing contact form:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err);
  res.status(500).json({ error: 'Unexpected server error' });
});

// Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));