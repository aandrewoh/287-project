const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
// ignore this stuff, cors was suggested to fix it but idk
const app = express();
const PORT = process.env.PORT || 3000;
const adminEmails = ['admin1@email.com', 'admin2@email.com'];
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

// copied from class example
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

// first iteration, doesn't seem to work
// // Registration endpoint
// app.post('/register', async (req, res) => {
//     const { firstName, lastName, email, password } = req.body;
//     const query = 'INSERT INTO users (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
//     db.query(query, [firstName, lastName, email, password], (err, result) => {
//         if (err) {
//             console.error('Error registering user', err);
//             res.status(500).send('Error registering user');
//         } else {
//             console.log('User registered');
//             res.status(201).send('User registered');
//         }
//     });
// });

// everything below is still my "first" iteration, doesn't follow class example so idk where its breaking
// Login endpoint
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const query = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error('Error querying database', err);
            res.status(500).send('Error logging in');
        } else if (results.length > 0) {
            const user = results[0];
            const isAdmin = adminEmails.includes(email);
            res.status(200).json({ message: 'Login successful', isAdmin });
        } else {
            res.status(401).send('Invalid credentials');
        }
    });
});

app.put('/edit-account', (req, res) => {
    const { email, firstName, lastName, password } = req.body;
    const query = 'UPDATE users SET firstName = ?, lastName = ?, password = ? WHERE email = ?';
    db.query(query, [firstName, lastName, password, email], (err, result) => {
        if (err) {
            console.error('Error updating user in database', err);
            res.status(500).send('Error editing account');
        } else if (result.affectedRows > 0) {
            res.status(200).send('Account updated');
        } else {
            res.status(404).send('User not found');
        }
    });
});

app.delete('/delete-account', (req, res) => {
    const { email, password } = req.body;
    const selectQuery = 'SELECT * FROM users WHERE email = ? AND password = ?';
    const deleteQuery = 'DELETE FROM users WHERE email = ?';

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

// const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use`);
    } else {
        console.error('Error starting server:', err);
    }
});