-- Create database
CREATE DATABASE portfolio_db;

-- Connect to database
\c portfolio_db

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Create projects table
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  image VARCHAR(255) NOT NULL,
  link VARCHAR(255) NOT NULL,
  language VARCHAR(50) NOT NULL
);

-- Create reviews table
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Create contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL
);

-- Insert sample projects with high-quality Unsplash images
INSERT INTO projects (title, description, image, link, language) VALUES
  ('E-Commerce Platform', 'A full-featured e-commerce site built with React and Node.js', 'https://images.unsplash.com/photo-1557821552-17105176677c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://example.com/ecommerce', 'JavaScript'),
  ('Data Analysis Tool', 'A Python-based tool for visualizing complex datasets', 'https://images.unsplash.com/photo-1551288049-b1f991c78f58?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://example.com/data-tool', 'Python'),
  ('Inventory System', 'A Java-based inventory management system', 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80', 'https://example.com/inventory', 'Java');