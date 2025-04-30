-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(15),
    country VARCHAR(50),
    password VARCHAR(100)
);
-- Create projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    type VARCHAR(50),
    description TEXT
);
-- Create reviews table
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(15),
    country VARCHAR(50),
    comment TEXT
);
-- Create contacts table
CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    message TEXT
);
-- Insert sample projects
INSERT INTO projects (name, type, description) VALUES
('E-Commerce', 'JavaScript', 'An online store built with JavaScript'),
('Data Analysis Tool', 'Python', 'A tool for data insights using Python'),
('Inventory System', 'Java', 'A system to manage inventory using Java');