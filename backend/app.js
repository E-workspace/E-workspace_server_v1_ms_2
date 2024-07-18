const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./config');

const skillRoutes = require('./routes/skillRoutes');

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));    
app.use(bodyParser.json());

// Routes

app.use('/api/skills', skillRoutes);
app.use('/api/startinterview/', skillRoutes);
app.use('/api/SaveCode/', skillRoutes)
app.use('/api/getSavedCode/', skillRoutes)
app.use('/api/start-interview/', skillRoutes)
app.use('/api/preBookedUser/', skillRoutes)
app.use('/api/checkBooking/', skillRoutes)
app.use('/api/Aiservice/', skillRoutes)

// Connect to MongoDB
mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));
    

const PORT = config.port || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
