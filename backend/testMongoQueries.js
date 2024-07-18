// Import required modules
const mongoose = require('mongoose');
const config = require('./config'); // Adjust path as necessary
const Skill = require('./model/skillModel'); // Adjust path as necessary

// Connect to MongoDB
mongoose.connect(config.dbUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Connected to MongoDB');

        // Example: Find one document matching username and email
        const username = "exampleuser";
        const email = "user@example.com";

        Skill.findOne({ "user.username": username, "user.email": email })
            .then(user => {
                if (user) {
                    console.log('User found:');
                    console.log(user);
                } else {
                    console.log('User not found');
                }
            })
            .catch(err => {
                console.error('Error finding user:', err);
            })
            .finally(() => {
                // Close MongoDB connection after queries
                mongoose.connection.close();
            });
    })
    .catch(err => {
        console.error('Error connecting to MongoDB:', err);
    });
