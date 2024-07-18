const mongoose = require('mongoose');

// Define the schema for the interview scheduling
const InterviewSchema = new mongoose.Schema({
  interviewDate: {
    type: Date,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address'],
  },
  bookingID: {
     type: String,
     unique: true,
     required: true 
    }
});

// Create the model from the schema
const Interview = mongoose.model('InterviewDate', InterviewSchema);

module.exports = Interview;
