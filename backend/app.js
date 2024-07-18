const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');
const config = require('./config');
const skillRoutes = require('./routes/skillRoutes');

const app = express();

// Middleware
const corsOptions = {
    origin: ['https://e-workspace-peach.vercel.app', 'http://localhost:3000'],
    credentials: true,
};
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json());

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// Add a route to get CSRF token
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://e-workspace-peach.vercel.app');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT,DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, csrf-token');
    next();
});

// Routes
app.use('/api/skills', skillRoutes);
app.use('/api/startinterview/', skillRoutes);
app.use('/api/SaveCode/', skillRoutes);
app.use('/api/getSavedCode/', skillRoutes);
app.use('/api/start-interview/', skillRoutes);
app.use('/api/preBookedUser/', skillRoutes);
app.use('/api/checkBooking/', skillRoutes);
app.use('/api/Aiservice/', skillRoutes);

// Connect to MongoDB
mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

const PORT = config.port || 8000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
