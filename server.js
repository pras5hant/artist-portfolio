const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const pool = new Pool({
  user: 'postgres', // Replace with your PostgreSQL username
  host: 'localhost',
  database: 'portfolio_db',
  password: '@@@123###456' , // Replace with your PostgreSQL password
  port: 5432
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'prashant2580thakur@gmail.com' , // Replace with your Gmail address
    pass: 'xzcr caux niqm bfgh'
 // Replace with your Gmail App Password
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
  const { name, email, phone, country, password } = req.body;
  const errors = validateUserInput({ name, email, phone, country, password }, false, true);
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }
  try {
    // Check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insert user
    await pool.query(
      'INSERT INTO users (name, email, phone, country, password, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [name, email, phone, country, hashedPassword]
    );
    // Send email notification
    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: 'your_email@gmail.com',
      subject: `New User Signup: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}`
    });
    res.json({ message: 'Signup successful' });
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects
app.get('/api/projects', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching projects:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all reviews
app.get('/api/reviews', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post a review
app.post('/api/reviews', async (req, res) => {
  const { name, email, phone, country, comment } = req.body;
  const errors = validateUserInput({ name, email, phone, country, comment }, true);
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }
  try {
    const result = await pool.query(
      'INSERT INTO reviews (name, email, phone, country, comment, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [name, email, phone, country, comment]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error saving review:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post contact form
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, country, message } = req.body;
  const errors = validateUserInput({ name, email, phone, country, message });
  if (Object.keys(errors).length) {
    return res.status(400).json({ errors });
  }
  try {
    await pool.query(
      'INSERT INTO contacts (name, email, phone, country, message, created_at) VALUES ($1, $2, $3, $4, $5, NOW())',
      [name, email, phone, country, message]
    );
    await transporter.sendMail({
      from: 'your_email@gmail.com',
      to: 'your_email@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nCountry: ${country}\nMessage: ${message}`
    });
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));