const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const db = require('./DB/db');
const { requireAuth } = require('./Authentfication/Jwt'); // Importation des fonctions d'authentification
const { Medicament, User } = require('./Schema/Schema'); // Assure-toi d'importer les bons modèles

const app = express();
app.use(cors({
    origin: 'http://localhost:3001', // Ajuste selon ton besoin
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Route d'ajout d'un médicament
app.post('/ControlDashboard', requireAuth, async (req, res) => {
    try {
        const medicament = new Medicament(req.body);
        await medicament.save();
        res.status(201).json({ message: 'Medicament added successfully', medicament });
    } catch (err) {
        res.status(500).json({ message: "Adding error", error: err.message });
    }
});

// Route de mise à jour d'un médicament
app.put('/ControlDashboard/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const medicament = await Medicament.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true
        });

        if (!medicament) {
            return res.status(404).json({ message: 'Medicament not found' });
        }

        res.status(200).json({ message: 'Medicament updated successfully', medicament });
    } catch (err) {
        res.status(500).json({ message: "Error in update", error: err.message });
    }
});

// Route de suppression d'un médicament
app.delete('/ControlDashboard/:id', requireAuth, async (req, res) => {
    try {
        const { id } = req.params;
        const medic = await Medicament.findByIdAndDelete(id);

        if (!medic) {
            return res.status(404).json({ message: 'Medicament not found' });
        }
        res.status(200).json({ message: 'Medicament deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting', error: err.message });
    }
});

// Route pour récupérer tous les médicaments
app.get('/Dashboard', requireAuth, async (req, res) => {
    try {
        const Medica = await Medicament.find();
        res.status(200).json(Medica);
    } catch (err) {
        res.status(500).json({ message: 'Error in fetching data', error: err.message });
    }
});

// Lancer le serveur
app.listen(3000, () => {
    console.log("Server running on port 3000");
});
