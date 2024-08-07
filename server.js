import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { db } from './config/db.js';
import serverless from "serverless-http";

const app = express();
const port = 5000;

app.use(cors());

app.use(express.json());

// User Registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 8);
    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: 'User registered successfully' });
    });
});

// User Login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) return res.status(500).send(err);
        if (results.length == 0) return res.status(404).send({ message: 'User not found' });

        const user = results[0];
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).send({ token: null });

        const token = jwt.sign({ id: user.id }, 'secretkey', { expiresIn: 86400 });
        res.status(200).send({ token });
    });
});

// Create Question
app.post('/createquestions', (req, res) => {
    const { question_text, option_a, option_b, option_c, option_d, correct_option } = req.body;
    db.query('INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_option) VALUES (?, ?, ?, ?, ?, ?)', 
        [question_text, option_a, option_b, option_c, option_d, correct_option], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: 'Question created successfully' });
    });
});

// Get Questions
app.get('/getquestions', (req, res) => {
    db.query('SELECT * FROM questions', (err, results) => {
        if (err) return res.status(500).send(err);
        res.status(200).send(results);
    });
});


// Submit Results
app.post('/submit', (req, res) => {
    const { userId, score } = req.body;
    db.query('INSERT INTO results (user_id, score) VALUES (?, ?)', [userId, score], (err, result) => {
        if (err) return res.status(500).send(err);
        res.status(200).send({ message: 'Results submitted successfully' });
    });
});


app.listen(port, ()=>{
    console.log(`Server running on ${port}`)
});

app.use("/.netlify/functions/app", router);
module.exports.handler = serverless(app);