// APLICACIÓN VULNERABLE - AUTOR: DAVID H. CUEVAS SALGADO
// Fecha: 21/11/2025
// Evaluación 3 - Ciberseguridad en Desarrollo

const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");

const app = express();
app.use(bodyParser.json());

// VULNERABILIDAD 1: Credenciales hardcodeadas
const SECRET_KEY = "mi_clave_super_secreta_123";
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "password123",
    database: "testdb"
};

// VULNERABILIDAD 2: SQL Injection
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const connection = mysql.createConnection(dbConfig);

    const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;

    connection.query(query, (error, results) => {
        if (error) {
            res.status(500).json({ error: error.message });
        } else if (results.length > 0) {
            const token = jwt.sign({ username }, SECRET_KEY);
            res.json({ token });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
        connection.end();
    });
});

// VULNERABILIDAD 3: Falta de validación de entrada
app.post("/user", (req, res) => {
    const userData = req.body;
    res.json({ message: "User created", data: userData });
});

// VULNERABILIDAD 4: XSS
app.get("/search", (req, res) => {
    const searchTerm = req.query.q;
    res.send(`<h1>Resultados para: ${searchTerm}</h1>`);
});

// VULNERABILIDAD 5: Exposición de información sensible
app.get("/debug", (req, res) => {
    res.json({
        env: process.env,
        config: dbConfig
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app;
