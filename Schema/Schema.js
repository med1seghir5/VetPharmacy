const mongoose = require('mongoose');

// Medicament Schema
const MedicamentSchema = new mongoose.Schema({
    name:{
        type: 'string',
    },

    AriDate:{
        type: Date,
        default: Date.now
    },

    ExpDate:{
        type: Date,
        default: Date.now,
        expires: 3600 * 24 * 30 // expires in 30 days
    },

    Quant:{
        type: Number,
        default: 0
    }
});

// User Schema
const UserSchema = new mongoose.Schema({
    Username:{
        type: String,
        required: true,
        unique: true
    },

    Password:{
        type: String,
        required: true,
        minlength: 6
    }
})

const Medicament = mongoose.model('Medicament', MedicamentSchema);
const User = mongoose.model('User', UserSchema);

module.exports = { Medicament, User };