const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema
const GetSavedCode = new Schema({

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
const getSavedCode = mongoose.model('GetSavedCode', GetSavedCode);

module.exports = getSavedCode;
