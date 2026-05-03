-- =====================================================
-- SkillBazaar Freelance Marketplace Database Script
-- Run this in MySQL Workbench
-- =====================================================

DROP DATABASE IF EXISTS skillbazaar;
CREATE DATABASE skillbazaar;
USE skillbazaar;

-- ─── CATEGORIES ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ─── USERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('buyer','seller','admin') DEFAULT 'buyer',
  full_name VARCHAR(100),
  bio TEXT,
  avatar_url VARCHAR(255),
  country VARCHAR(50),
  dob DATE,
  language VARCHAR(50),
  wallet_balance DECIMAL(10,2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ─── GIGS ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS gigs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  seller_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_days INT NOT NULL DEFAULT 3,
  revisions INT DEFAULT 1,
  image_url VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  avg_rating DECIMAL(3,2) DEFAULT 0.00,
  total_orders INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- ─── ORDERS ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  gig_id INT NOT NULL,
  buyer_id INT NOT NULL,
  seller_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  status ENUM('pending','in_progress','completed','cancelled','disputed') DEFAULT 'pending',
  delivery_date DATE,
  requirements TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── REVIEWS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  gig_id INT NOT NULL,
  reviewer_id INT NOT NULL,
  seller_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── MESSAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── PAYMENTS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL UNIQUE,
  buyer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('card','paypal','wallet','mock') DEFAULT 'mock',
  status ENUM('pending','completed','refunded','failed') DEFAULT 'pending',
  transaction_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── FAVORITES ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  gig_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_favorite (user_id, gig_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);
-- ─── WALLET TRANSACTIONS ─────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  type ENUM('topup','payment','earnings','withdrawal') NOT NULL,
  status ENUM('pending','completed','failed') DEFAULT 'completed',
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── NOTIFICATIONS ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  message VARCHAR(255) NOT NULL,
  link VARCHAR(255),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CUSTOM OFFERS ───────────────────────────────────
CREATE TABLE IF NOT EXISTS custom_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_id INT NOT NULL,
  receiver_id INT NOT NULL,
  gig_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  delivery_days INT NOT NULL DEFAULT 3,
  status ENUM('pending','accepted','rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (gig_id) REFERENCES gigs(id) ON DELETE CASCADE
);

-- ─── PORTFOLIOS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  link VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Categories
INSERT INTO categories (name, icon) VALUES
('Web Development', 'code'),
('Graphic Design', 'palette'),
('Digital Marketing', 'trending_up'),
('Video & Animation', 'videocam'),
('Writing & Translation', 'edit'),
('Music & Audio', 'music_note'),
('Data & Analytics', 'bar_chart'),
('Mobile Apps', 'smartphone');

-- Users (passwords are bcrypt of 'password123')
INSERT INTO users (username, email, password, role, full_name, bio, country) VALUES
('admin_user', 'admin@skillbazaar.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'admin', 'Admin User', 'Platform administrator', 'US'),
('john_dev', 'john@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'John Smith', 'Full-stack developer with 5 years experience in React and Node.js', 'IN'),
('sara_design', 'sara@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Sara Lee', 'Creative UI/UX designer and brand identity expert', 'UK'),
('mike_buyer', 'mike@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'buyer', 'Mike Johnson', 'Entrepreneur looking for great talent', 'CA'),
('priya_dev', 'priya@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Priya Patel', 'Mobile app developer specializing in React Native and Flutter', 'IN'),
('alex_writer', 'alex@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Alex Turner', 'Expert copywriter and content strategist.', 'AU'),
('emily_video', 'emily@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Emily Chen', 'Professional video editor and animator.', 'US'),
('david_data', 'david@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'David Kim', 'Data scientist and Python enthusiast.', 'KR'),
('sophia_seo', 'sophia@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Sophia Martinez', 'Digital marketing and SEO specialist.', 'ES'),
('chris_music', 'chris@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Chris Taylor', 'Audio engineer and music producer.', 'CA'),
('olivia_buyer', 'olivia@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'buyer', 'Olivia Brown', 'Startup founder.', 'UK'),
('james_buyer', 'james@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'buyer', 'James Wilson', 'Agency owner.', 'US'),
('liam_buyer', 'liam@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'buyer', 'Liam Garcia', 'Looking for reliable freelancers.', 'MX'),
('emma_buyer', 'emma@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'buyer', 'Emma Thomas', 'E-commerce store manager.', 'DE'),
('noah_dev', 'noah@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Noah Moore', 'Backend specialist in Python and Go.', 'SE'),
('mia_design', 'mia@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Mia Anderson', 'Illustrator and character designer.', 'FR'),
('lucas_marketing', 'lucas@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Lucas Martin', 'Social media manager.', 'BR'),
('isabella_writer', 'isabella@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Isabella White', 'Technical writer and documentation expert.', 'CA'),
('ethan_video', 'ethan@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Ethan Harris', 'Motion graphics artist.', 'UK'),
('ava_data', 'ava@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LPVv.P4L6OK', 'seller', 'Ava Clark', 'Machine learning engineer.', 'US');

-- Gigs
INSERT INTO gigs (seller_id, category_id, title, description, price, delivery_days, revisions, avg_rating, total_orders) VALUES
(2, 1, 'Build a full-stack React + Node.js web app', 'I will build a complete, production-ready web application using React.js for the frontend and Node.js/Express for the backend with MySQL database integration.', 149.00, 7, 3, 4.80, 24),
(2, 1, 'Fix React or Node.js bugs fast', 'Stuck on a bug? I will diagnose and fix issues in your React or Node.js project quickly and explain the solution clearly.', 29.00, 1, 2, 4.90, 56),
(3, 2, 'Design a stunning logo for your brand', 'I will create a unique, professional logo with unlimited concepts until you are 100% satisfied. All file formats included.', 59.00, 3, 5, 4.70, 38),
(3, 2, 'Design a modern UI/UX for your website', 'I will design beautiful, responsive website mockups in Figma with a focus on user experience and conversion.', 99.00, 5, 3, 4.85, 17),
(5, 8, 'Build a React Native mobile app', 'I will develop a cross-platform mobile application for iOS and Android using React Native with clean code and modern design.', 199.00, 10, 2, 4.75, 12),
(6, 5, 'Write SEO optimized blog posts', 'I will write highly engaging, SEO optimized articles and blog posts for your website.', 35.00, 2, 2, 4.90, 45),
(6, 5, 'Professional copywriting for landing pages', 'I will write persuasive copy that converts visitors into customers.', 80.00, 4, 3, 4.80, 20),
(7, 4, 'Edit your YouTube videos like a pro', 'I will edit your raw footage into engaging YouTube videos with transitions, effects, and color grading.', 45.00, 3, 2, 4.95, 60),
(7, 4, 'Create 2D explainer animation', 'I will create a high-quality 2D animated explainer video for your business or product.', 150.00, 7, 4, 4.88, 15),
(8, 7, 'Perform data analysis with Python', 'I will clean, analyze and visualize your data using Pandas, Matplotlib, and Seaborn.', 60.00, 3, 2, 4.75, 25),
(8, 7, 'Build custom web scrapers', 'I will build a custom Python web scraper to extract data from any website.', 40.00, 2, 1, 4.80, 30),
(9, 3, 'Manage your Google Ads campaigns', 'I will setup and manage your Google Ads campaigns for maximum ROI.', 120.00, 5, 2, 4.60, 10),
(9, 3, 'Comprehensive SEO audit', 'I will perform a technical SEO audit of your website and provide an actionable report.', 50.00, 3, 1, 4.90, 40),
(10, 6, 'Mix and master your song', 'I will professionally mix and master your track to industry standards.', 70.00, 4, 3, 4.95, 22),
(10, 6, 'Create custom background music', 'I will compose original background music for your video, podcast, or game.', 90.00, 5, 2, 4.85, 18),
(15, 1, 'Develop RESTful API in Go', 'I will design and develop a scalable RESTful API using Golang.', 180.00, 7, 3, 5.00, 8),
(15, 1, 'Deploy your app to AWS', 'I will setup and deploy your application to AWS using Docker and EC2.', 100.00, 3, 1, 4.70, 14),
(16, 2, 'Create custom vector illustrations', 'I will design custom vector illustrations for your website or app.', 45.00, 4, 2, 4.90, 32),
(16, 2, 'Design eye-catching social media posts', 'I will design professional templates and posts for Instagram, Facebook, and LinkedIn.', 30.00, 2, 3, 4.85, 50),
(17, 3, 'Organic Instagram growth strategy', 'I will provide a strategy and manage your Instagram for organic growth.', 80.00, 7, 1, 4.50, 12),
(18, 5, 'Write comprehensive technical documentation', 'I will write clear, concise documentation for your software or API.', 110.00, 6, 2, 4.90, 10),
(19, 4, 'Create dynamic motion graphics', 'I will design stunning motion graphics and logo intros.', 65.00, 3, 3, 4.80, 28),
(20, 7, 'Train custom machine learning models', 'I will train and evaluate custom ML models for your specific use case.', 250.00, 14, 2, 5.00, 5);

-- Orders
INSERT INTO orders (gig_id, buyer_id, seller_id, price, status, delivery_date, requirements) VALUES
(1, 4, 2, 149.00, 'completed', '2025-04-10', 'Need an e-commerce website with product catalog, cart, and checkout.'),
(3, 4, 3, 59.00, 'completed', '2025-04-05', 'Logo for my tech startup called ByteForge. Blue and dark color scheme.'),
(2, 4, 2, 29.00, 'in_progress', '2025-05-05', 'My React app crashes when navigating to the profile page. Error attached.'),
(4, 4, 3, 99.00, 'pending', '2025-05-10', 'Need a landing page design for a SaaS product.'),
(6, 11, 6, 35.00, 'completed', '2025-04-15', 'Write a 1000 word blog post about artificial intelligence trends.'),
(8, 11, 7, 45.00, 'completed', '2025-04-20', 'Edit this 10 minute vlog, add background music and cuts.'),
(10, 12, 8, 60.00, 'completed', '2025-04-22', 'Analyze this sales dataset and create visualizations.'),
(13, 13, 9, 50.00, 'completed', '2025-04-25', 'Perform SEO audit on mydomain.com.'),
(14, 14, 10, 70.00, 'completed', '2025-04-28', 'Mix my new pop track. Stems attached.'),
(5, 11, 5, 199.00, 'in_progress', '2025-05-12', 'Build an iOS app for my restaurant.'),
(7, 12, 6, 80.00, 'pending', '2025-05-08', 'Landing page copy for a new fitness program.'),
(9, 13, 7, 150.00, 'in_progress', '2025-05-15', '1-minute explainer animation for our software.'),
(11, 14, 8, 40.00, 'completed', '2025-04-30', 'Scrape product prices from competitor website.'),
(12, 4, 9, 120.00, 'in_progress', '2025-05-20', 'Manage our summer ad campaign.'),
(16, 11, 15, 180.00, 'completed', '2025-05-01', 'Build backend API for user management.'),
(18, 12, 16, 45.00, 'completed', '2025-05-02', 'Create 5 custom illustrations for our blog.'),
(21, 13, 18, 110.00, 'pending', '2025-05-18', 'Write API documentation for our new endpoints.'),
(22, 14, 19, 65.00, 'in_progress', '2025-05-09', 'Create a 10s logo animation.'),
(23, 4, 20, 250.00, 'pending', '2025-05-25', 'Train a model to classify customer support tickets.');

-- Reviews
INSERT INTO reviews (order_id, gig_id, reviewer_id, seller_id, rating, comment) VALUES
(1, 1, 4, 2, 5, 'Outstanding work! John delivered a perfect e-commerce site ahead of schedule. The code is clean and well-documented.'),
(2, 3, 4, 3, 5, 'Sara is incredibly talented. The logo exceeded all my expectations. Will definitely hire again!'),
(5, 6, 11, 6, 5, 'Alex is a fantastic writer. The blog post was well-researched and engaging.'),
(6, 8, 11, 7, 4, 'Great editing work. Fast turnaround and good communication.'),
(7, 10, 12, 8, 5, 'David provided excellent insights from the data. The visualizations were very clear.'),
(8, 13, 13, 9, 5, 'The SEO audit was incredibly thorough and helped us identify several critical issues.'),
(9, 14, 14, 10, 5, 'Chris made my track sound huge! Very professional mixing and mastering.'),
(13, 11, 14, 8, 4, 'The scraper works perfectly. Saved me hours of manual work.'),
(15, 16, 11, 15, 5, 'Noah is a Go expert. The API is robust and well-structured.'),
(16, 18, 12, 16, 5, 'Mia created beautiful illustrations that perfectly match our brand style.');

-- Payments
INSERT INTO payments (order_id, buyer_id, amount, method, status, transaction_id) VALUES
(1, 4, 149.00, 'card', 'completed', 'TXN-2025-001'),
(2, 4, 59.00,  'paypal', 'completed', 'TXN-2025-002'),
(3, 4, 29.00,  'wallet', 'completed', 'TXN-2025-003'),
(4, 4, 99.00,  'card', 'pending',   'TXN-2025-004'),
(5, 11, 35.00, 'card', 'completed', 'TXN-2025-005'),
(6, 11, 45.00, 'paypal', 'completed', 'TXN-2025-006'),
(7, 12, 60.00, 'card', 'completed', 'TXN-2025-007'),
(8, 13, 50.00, 'wallet', 'completed', 'TXN-2025-008'),
(9, 14, 70.00, 'paypal', 'completed', 'TXN-2025-009'),
(10, 11, 199.00, 'card', 'completed', 'TXN-2025-010'),
(11, 12, 80.00, 'paypal', 'pending', 'TXN-2025-011'),
(12, 13, 150.00, 'wallet', 'completed', 'TXN-2025-012'),
(13, 14, 40.00, 'card', 'completed', 'TXN-2025-013'),
(14, 4, 120.00, 'paypal', 'completed', 'TXN-2025-014'),
(15, 11, 180.00, 'card', 'completed', 'TXN-2025-015'),
(16, 12, 45.00, 'wallet', 'completed', 'TXN-2025-016'),
(17, 13, 110.00, 'paypal', 'pending', 'TXN-2025-017'),
(18, 14, 65.00, 'card', 'completed', 'TXN-2025-018'),
(19, 4, 250.00, 'wallet', 'pending', 'TXN-2025-019');

-- Messages
INSERT INTO messages (sender_id, receiver_id, content) VALUES
(4, 2, 'Hi John, I just placed an order. Can we discuss the project details?'),
(2, 4, 'Of course! I''ve reviewed your requirements. Let''s schedule a quick call to align on the design.'),
(4, 2, 'Sounds great! I''m available tomorrow at 3pm.'),
(4, 3, 'Hi Sara, love the logo concepts! Can you make the font slightly bolder?'),
(3, 4, 'Absolutely! I''ll send you the updated version within the hour.'),
(11, 6, 'Hi Alex, I love your writing style. Can you write a piece on AI?'),
(6, 11, 'Yes, definitely. I can have the draft ready by tomorrow.'),
(12, 8, 'David, the visualization looks great, but could we change the color scheme to match our brand?'),
(8, 12, 'Sure thing, just send me your brand guidelines.'),
(13, 9, 'Thanks for the SEO audit, Sophia. It was very helpful.'),
(9, 13, 'You''re welcome! Let me know if you need help implementing the recommendations.'),
(14, 10, 'Chris, the mix is almost perfect. Just a bit more bass?'),
(10, 14, 'No problem, I will boost the low end and send you a new bounce.');

-- Favorites
INSERT INTO favorites (user_id, gig_id) VALUES
(4, 1),
(4, 3),
(4, 5),
(11, 6),
(11, 8),
(12, 10),
(13, 13),
(14, 14),
(4, 23),
(11, 16),
(12, 18);

-- Update gig ratings trigger (manual update for sample data)
UPDATE gigs SET avg_rating = 5.00, total_orders = 1 WHERE id IN (1, 3, 6, 8, 10, 13, 14, 11, 16, 18);

SELECT 'SkillBazaar database setup complete!' AS status;
