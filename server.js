// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // change if your MySQL user is different
    password: '', // put your MySQL password if you set one
    database: 'ecomstore'
});

db.connect(err => {
    if (err) {
        console.error('❌ MySQL connection failed:', err);
        return;
    }
    console.log('✅ Connected to MySQL');
});

// API route to fetch products
app.get('/api/products', (req, res) => {
    db.query('SELECT * FROM products', (err, results) => {
        if (err) {
            console.error('Error fetching products:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});
// API route to fetch hot selling items
app.get('/api/hot-products', (req, res) => {
    db.query('SELECT * FROM products WHERE is_hot = 1 LIMIT 3', (err, results) => {
        if (err) {
            console.error('Error fetching hot products:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});
// API route to add new product
app.post('/api/products', (req, res) => {
    const { name, description, price, category, image } = req.body;

    if (!name || !price || !category || !image) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const query = `INSERT INTO products (name, description, price, category, image_url) 
                 VALUES (?, ?, ?, ?, ?)`;

    db.query(query, [name, description, price, category, image], (err, result) => {
        if (err) {
            console.error('Error inserting product:', err);
            return res.status(500).json({ error: 'Database insert failed' });
        }
        res.json({ success: true, id: result.insertId, message: 'Product added successfully' });
    });
});
// Add this at the top with other imports
const bcrypt = require('bcrypt');

// ==================== REGISTER ====================
app.post('/api/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into DB
        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.query(query, [name, email, hashedPassword], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ error: 'Email already registered' });
                }
                console.error('Error registering user:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ success: true, message: 'User registered successfully!' });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ==================== LOGIN ====================
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    const query = `SELECT * FROM users WHERE email = ?`;
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // ✅ Login success
        res.json({
            success: true,
            message: 'Login successful!',
            user: { id: user.id, name: user.name, email: user.email }
        });
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
