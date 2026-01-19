const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const Country = require('./models/Country');
const Score = require('./models/Score')
const User = require('./models/User')

require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI;
const app = express();
const PORT = process.env.PORT || 6969;
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

async function authenticateToken (req, res, next) {
    try{
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ message: "No token provided" });

        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(payload.id);

        if (!user) return res.status(404).json({ message: "User not found" });
        req.user = user
        next();
    } catch (error) {
        console.log("Error adding score middleware ", error);
        res.status(401).json({ message: "unauthorized" });
    }
}

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
        try {
            await Country.insertMany(countryAndFlag, { ordered: false });
        } catch (dbError) {
            console.log("DB ERROR, CONTINUING ANYWAY")
        }
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

app.post('/add-score', authenticateToken, async(req, res) => {
    try {
        const newScore = new Score({
            username: req.user.username,
            points: req.body.points
        });
        const savedScore = await newScore.save();
        res.status(201).json(savedScore);
    } catch (error) {
        console.log("error adding", error);
        res.status(400).json({ message: error.message })
    }
});

app.post('/api/auth/signup', async(req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            password: req.body.password
        });

        const savedUser = await newUser.save();
        const token = jwt.sign({ "id": savedUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });

        res.status(201).json({token, user: {id: savedUser._id, username: savedUser.username}});
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "username already taken" })
        }
        console.log("Error with signup", error);
        res.status(400).json({ message: error.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const reqUserInfo = { username: req.body.username, password: req.body.password }
        const findUser = await User.findOne({ username: reqUserInfo.username });

        if(!findUser) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const passwordIsCorrect = await findUser.comparePassword(reqUserInfo.password);
        if(!passwordIsCorrect) {
            return res.status(400).json({ message: "Invalid credentials"})
        }

        const token = jwt.sign({ id: findUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
        res.status(200).json({token, user: { id: findUser._id, username: findUser.username }});
    } catch (error) {
        console.error(error)
        res.status(500).json({ message: "Something went wrong", error })
    }
})

app.get('/leaderboard/my-scores', authenticateToken, async(req, res) => {
    try {
        const username = req.user.username
        const scores = await Score.find({ username }).sort({ createdAt: -1 }).lean();
        res.status(200).json({scores: scores});
    } catch (error) {
        res.status(500).json({ message: "Something went wrong" })
    }
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});