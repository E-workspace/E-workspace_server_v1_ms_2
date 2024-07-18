const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    user: {
        email: { type: String, required: true },
        username: { type: String, required: true }  
    },
    skills: [
        {
            skill: { type: String, required: true },
            level: { type: String, required: true }
        }
    ]
});

module.exports = mongoose.model('Skill', skillSchema);
