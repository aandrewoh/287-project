/*
* Authors: Andrew Oh 40166897
* Class: SOEN 287
*/

const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "myapp",
});

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static("public"));

db.connect((err) => {
    if (err) {
        console.log("Error connecting to database:", err.stack);
        return;
    } else {
        console.log("Connected to database: " + db.threadId);
    }
});

// Get all users
app.get("/", (req, res) => {
    let sqlStatement = "SELECT * FROM user";

    db.query(sqlStatement, (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error fetching users");
        } else {
            console.log(result);
            res.send(result);
        }
    });
});

// Get user by email
app.get("/user/:email", (req, res) => {
    let sqlStatement = "SELECT * FROM user WHERE email = ?";

    db.query(sqlStatement, [req.params.email], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error fetching user");
        } else if (result.length > 0) {
            res.status(200).json(result[0]);
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Register endpoint
app.post("/register", (req, res) => {
    let { firstName, lastName, email, password } = req.body;
    let sqlStatement = "INSERT INTO user (firstName, lastName, email, password) VALUES (?, ?, ?, ?)";

    let query = db.query(sqlStatement, [firstName, lastName, email, password], (err, result) => {
        if (err) {
            console.log(err);
            res.send("Error registering user");
        } else {
            console.log(result);
            res.send("User registered");
        }
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM user WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying database', err);
            res.status(500).send('Error logging in');
        } else if (results.length > 0) {
            res.status(200).json({ message: 'Login successful' });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

// Edit account endpoint
app.put('/edit-account', (req, res) => {
    const { email, firstName, lastName, password } = req.body;
    const fieldsToUpdate = [];
    const values = [];

    if (firstName) {
        fieldsToUpdate.push('firstName = ?');
        values.push(firstName);
    }
    if (lastName) {
        fieldsToUpdate.push('lastName = ?');
        values.push(lastName);
    }
    if (password) {
        fieldsToUpdate.push('password = ?');
        values.push(password);
    }
    values.push(email);

    if (fieldsToUpdate.length === 0) {
        return res.status(400).send('No fields to update');
    }

    const query = `UPDATE user SET ${fieldsToUpdate.join(', ')} WHERE email = ?`;
    db.query(query, values, (err, result) => {
        if (err) {
            console.error('Error updating user in database', err);
            res.status(500).send('Error editing account');
        } else if (result.affectedRows > 0) {
            res.status(200).send('Account updated');
            sessionStorage.setItem('userEmail', email);
        } else {
            res.status(404).send('User not found');
        }
    });
});

// Delete account endpoint
app.delete('/delete-account', (req, res) => {
    const { email, password } = req.body;
    const selectQuery = 'SELECT * FROM user WHERE email = ? AND password = ?';
    const deleteQuery = 'DELETE FROM user WHERE email = ?';

    db.query(selectQuery, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying database', err);
            res.status(500).send('Error deleting account');
        } else if (results.length > 0) {
            db.query(deleteQuery, [email], (err, result) => {
                if (err) {
                    console.error('Error deleting user from database', err);
                    res.status(500).send('Error deleting account');
                } else {
                    res.status(200).send('Account deleted');
                }
            });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});