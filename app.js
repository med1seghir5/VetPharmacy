const express = require('express');
const jwt = require('jwt');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const db = require('./DB/db');
const { requireAuth } = require('./Authentfication/Jwt');
const { Medicament } = require('./Schema/Schema');


const app = express();
app.use(cors());
app.use(express.json());

app.use('/Auth', AuthApp);

app.post('/ControlDashboard',requireAuth, async (req, res) => {
    try{
        const medicament = new Medicament(req.body);
        await medicament.save();
        res.status(201).json('Medicament added successfully', medicament);
    }catch(err){
        res.status(500).json({ message: "Adding error", error: err.message })
    }
})

app.put('/ControlDashboard', requireAuth , async(req , res) => {
    try{
        
    } catch(err){
        res.status(500).json({ message: "Updating error", error: err.message })
    }
})






app.listen(3000, () => {
    console.log("Server running on port 3000");
});
