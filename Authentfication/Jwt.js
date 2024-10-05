const express = require('express');
const mongoose = require('mongoose');
const mongodb = require('mongodb');
const cors = require('cors');
const { hash, compare } = require('bcrypt');
const { User } = require('../Schema/Schema');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cookieParser())

app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
}));

// Array to store refresh tokens
let refreshTokens = [];

// Function to generate a refresh token
function generateRefreshToken(user) {
    const payload = {
        userId: user._id,
        username: user.Username,
    };
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    refreshTokens.push(refreshToken);
    return refreshToken;
}

// Function to generate an access token
function generateAccessToken(user) {
    const payload = {
        userId: user._id,
        username: user.Username,
    };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '2m' });
}


// Middleware for authentication
function authenticateToken(req, res, next) {
    const token = req.cookies.accessToken;
    if (!token) {
        console.log("No token provided");
        return res.status(401).json({ message: "Authorization token required" }); // Renvoie un message
    }

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, user) => {
        if (err) {
            console.log("Token verification failed:", err);
            return res.status(403).json({ message: "Invalid or expired token" }); // Renvoie un message
        }
        try {
            req.user = await User.findById(user.userId).select('-Password');
            next();
        } catch (error) {
            console.log("Error finding user:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
}


const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.status(403).json({ message: "Invalid or expired token" }); // Renvoie un code 403 pour token invalide
            } else {
                console.log("User found:", decodedToken);
                next(); // Passe à la prochaine middleware si tout est bon
            }
        });
    } else {
        console.log("No token provided");
        res.status(401).json({ message: "Authorization token required" }); // 401 pour token manquant
    }
};

// Registration route
app.post('/register', async (req, res) => {
    const { Username, Password } = req.body;
    try {
        // Verify if username exists
        const existingUser = await User.findOne({ Username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        // Hash password
        const hashedPassword = await hash(Password, 10);

        // Create a new user
        const newUser = new User({ Username, Password: hashedPassword });

        // Save the new user to the database
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering user', error });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { Username, Password } = req.body;
    try {
        // Verify if the user exists in the database
        const user = await User.findOne({ Username });
        if (!user) return res.status(403).json({ message: 'Invalid username or password' });

        // Verify if the password is correct
        const valid = await compare(Password, user.Password);
        if (!valid) return res.status(403).json({ message: 'Invalid username or password' });

        // Generate the tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        // Store the tokens in cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 2 * 60 * 1000 // 2 minutes
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ message: 'Logged in successfully', user: { username: user.Username } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Logout route
app.post('/logout', (req, res) => {
    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});

// Protected route by JWT
app.get('/protected', requireAuth, (req, res) => {
    res.json({ message: 'You have access to this protected resource', user: req.user });
});

// Refresh token route
app.post('/token', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || !refreshTokens.includes(refreshToken)) return res.sendStatus(403);

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);

        const accessToken = generateAccessToken({ userId: user.userId, username: user.username });
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 2 * 60 * 1000 // 2 minutes
        });

        res.json({ message: 'Access token refreshed successfully' });
    });
});

// Current User route
app.get('/current-user', authenticateToken, (req, res) => {
    const user = req.user;
    if (user) {
        return res.status(200).json({ currentUser: user });
    } else {
        return res.status(401).json({ message: 'Unauthorized' });
    }
});

module.exports = { requireAuth }
