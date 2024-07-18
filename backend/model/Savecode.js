const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const savedCodeSchema = new Schema({

   filename: {
        type : String,
        required: true
    },
  code: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  }
});

// Create the model
const SavedCode = mongoose.model('SavedCode', savedCodeSchema);

module.exports = SavedCode;
