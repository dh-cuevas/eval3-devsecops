 // APLICACIÓN SEGURA - CORRECCIONES APLICADAS
 // AUTOR: DAVID H. CUEVAS SALGADO
 // Evaluación 3 - Ciberseguridad en Desarrollo

 const express = require('express');
 const bodyParser = require('body-parser');
 const mysql = require('mysql');
 const jwt = require('jsonwebtoken');
 const helmet = require('helmet');
 const rateLimit = require('express-rate-limit');
 require('dotenv').config();

 const app = express();

 app.use(helmet());

 const limiter = rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
 });
 app.use(limiter);

 app.use(bodyParser.json());

 const SECRET_KEY = process.env.JWT_SECRET || require('crypto').randomBytes(64).toString('hex');
 const dbConfig = {
     host: process.env.DB_HOST || 'localhost',
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD,
     database: process.env.DB_NAME || 'testdb'
 };

 app.post('/login', (req, res) => {
     const { username, password } = req.body;
     
     if (!username || !password) {
         return res.status(400).json({ error: 'Username and password required' });
     }
     
     const connection = mysql.createConnection(dbConfig);
     const query = 'SELECT * FROM users WHERE username = ? AND password = ?';
     
     connection.query(query, [username, password], (error, results) => {
         if (error) {
             console.error('Database error:', error);
             res.status(500).json({ error: 'Internal server error' });
         } else if (results.length > 0) {
             const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
             res.json({ token });
         } else {
             res.status(401).json({ error: 'Invalid credentials' });
         }
         connection.end();
     });
 });

 app.post('/user', (req, res) => {
     const { name, email, age } = req.body;
     
     if (!name || typeof name !== 'string' || name.length > 100) {
         return res.status(400).json({ error: 'Invalid name' });
     }
     
     if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
         return res.status(400).json({ error: 'Invalid email' });
     }
     
     if (age && (typeof age !== 'number' || age < 0 || age > 150)) {
         return res.status(400).json({ error: 'Invalid age' });
     }
     
     res.json({ message: 'User created', data: { name, email, age } });
 });

 const escapeHtml = (unsafe) => {
     return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 };

 app.get('/search', (req, res) => {
     const searchTerm = req.query.q || '';
     const safeTerm = escapeHtml(searchTerm);
     res.send(`<h1>Resultados para: ${safeTerm}</h1>`);
 });

 if (process.env.NODE_ENV === 'development') {
     app.get('/debug', (req, res) => {
         res.json({
             message: 'Debug endpoint - only in development'
         });
     });
 }

 app.get('/health', (req, res) => {
     res.json({ status: 'healthy', timestamp: new Date().toISOString() });
 });

 const PORT = process.env.PORT || 3000;
 app.listen(PORT, () => {
     console.log(`Secure server running on port ${PORT}`);
 });

 module.exports = app;
