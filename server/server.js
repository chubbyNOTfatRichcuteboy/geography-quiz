const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Country = require('./models/Country');
const Score = require('./models/Score')
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
const app = express();
const PORT = 5001;
const url = "https://geography.underscore.wtf/countries.json";


async function connect() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Database connected")
    } catch (error) {
        console.log("Could not connect to mongoDB: ", error.message)
    }
}
connect();


app.use(cors());
app.use(express.json());


app.get('/api/countries', async(req, res) => {
    try {
        const cachedCountries = await Country.find();
        if (cachedCountries.length > 0) {
            console.log("Serving from mongoDB cache");
            return res.json(cachedCountries);
        }
        // else, fetch from api
        console.log("Cache miss. Fetching from external api")
        const response = await fetch(url);
        const data = await response.json();
        console.log("3. data received from api");
        countryAndFlag = data.map(countryinfo => ({
            name: countryinfo.name,
            imagelink: countryinfo.flags
        }));

        await Country.deleteMany({});
        await Country.insertMany(countryAndFlag);

        res.status(201).json(countryAndFlag);
    } catch (error) {
        console.log("error fetching", error);
        res.status(500).json({ error: "Failed to fetch data" });
    }
});

app.get('/leaderboard', async(req, res) => {
    try {
        const scores = await Score.find().sort({ points: -1 }).limit(10);
        res.json(scores)
    } catch (error) {
        console.log("error fetching db", error)
        res.status(500).json({ message: error.message })
    }
})

app.post('/add-score', async(req, res) => {
    try {
        const newScore = new Score({
            username: req.body.username,
            points: req.body.points
        });
        const savedScore = await newScore.save();
        res.status(201).json(savedScore);
    } catch (error) {
        console.log("error adding", error);
        res.status(400).json({ message: error.message })
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});