const mongoose = require('mongoose');
require('dotenv').config();

mongoose.set('strictQuery', true);

// Connexion to MongoDB 
const db = mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => {
    console.error('Could not connect to MongoDB', err);
    process.exit(1); // Arrêter le serveur si la connexion échoue
});

module.exports = db;

