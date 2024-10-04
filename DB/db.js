const mongoose = require('mongoose');
require('dotenv').config();
mongoose.set('strictQuery', true);

// Connect to MongoDB
const db = mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

module.exports = db;