const mongoose = require('mongoose');
const config = require('../config'); // Adjust path as necessary
const Skill = require('../model/skillModel'); // Adjust path as necessary
const Savecode = require('../model/Savecode')
const GetSavedCode = require('../model/GetSavedCode')
const SheduleInterview = require('../model/SheduleInterview')
const sendEmail = require('./utils/mailer'); // Adjust path as necessary
const axios = require('axios')
require('dotenv').config()

exports.addSkills = async (req, res) => {
    const { user, skills } = req.body;

    try {
        console.log(user, skills, "problem area")
        const newSkill = new Skill({ user, skills });
        const data = await newSkill.save();
        console.log(data)
        res.status(200).json({ message: 'Skills and user data added successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


const getquestionsFromCloud = async (userdetails) => {
  const questions = [];

  for (let i = 0; i < userdetails.length; i++) {
      const { skill, level } = userdetails[i];

      const skillPath = skill.toLowerCase() // Convert skill to lowercase and replace spaces with hyphens
      const levelPath = level.toLowerCase();

      try {
          const response = await axios.get(`https://api.github.com/repos/${process.env.GITHUB_USERNAME}/questionBank/contents/${skillPath}/${levelPath}/questions.json`, {
              headers: {
                  'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                  'Accept': 'application/vnd.github.v3.raw' // To get the raw content
              }
          });

          if (response.status === 200 && response.data) {
              const retrievedQuestions = response.data;
              questions.push({
                  skill,
                  level,
                  questions: retrievedQuestions
              });

             
          }
      } catch (error) {
          console.error(`Error retrieving questions for ${skill} at ${level} level:`, error.message);
      }
  }

  return questions;
};


exports.getQuestions = async (req, res) => {
    const { username, email, role } = req.body;

    console.log( username, email, role, "getquestions")

    if (!username || !email || !role) {
        return res.status(400).json({ message: 'Username, email, and role are required' });
    }

    try {
       

        const user = await Skill.findOne({ "user.username": username, "user.email": email });

        if (user) {
            console.log('User found:');

            console.log(user.skills);

            const questions = await getquestionsFromCloud(user.skills);
            console.log(questions, "cloud questions")
            
            res.status(200).json({ questions:questions });
        } else {
            console.log('User not found');
            res.status(404).json({ message: 'User not found' });
        }
    } catch (err) {
        console.error('Error finding user:', err);
        res.status(500).json({ message: 'Server error' });
    } 
};

exports.Savecode = async (req, res) =>{
  
    const { filename, username, email, code , date} = req.body;

    if (!filename || !username || !email || !code || !date ) {
        return res.status(400).json({ message: 'All fileds Are Must Required' });
    }

    try {
      const newEntry = new Savecode({filename : filename, code : code , date : date, email : email, username : username})

      const result = await newEntry.save()

      if(!result) { 

        return res.staus(400).json({error : "error While Saving record"})
      }

      res.status(200).json({message : "Record Saved Successfully"})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }

}



exports.getSavedCode = async (req, res) =>{
    const { username, email} = req.body;

    if (!username || !email  ) {
        return res.status(400).json({ message: 'Some Fields Are Missing While Getting Saved code' });
    }

    try {
      const result = await Savecode.find({username:username, email : email})
      console.log(result, "res")

      if(!result) { 

        return res.staus(400).json({error : "error While Getting record"})
      }

      res.status(200).json({data : result})
    } catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }

}

exports.deleteCode = async (req, res) => {
    const { filename } = req.body;
  
    if (!filename) {
      return res.status(400).json({ message: 'Filename is required to delete the code' });
    }
  
    try {
      await Savecode.deleteOne({ filename: filename });
      res.status(200).json({ message: 'Code deleted successfully' });
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ message: error.message });
    }
  };


  const isAllowedDate = (date) => {
    const day = date.getDay();
    return day === 5 || day === 6 || day === 0;
  };

  function generateUniqueBookingID(startDigit = 1) {
    const min = Math.pow(10, 4); // 10000
    const max = Math.pow(10, 5) - 1; // 99999
    let id;

    do {
        id = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (id.toString()[0] !== startDigit.toString());

    return id;
}

exports.SheduleInterview = async (req, res) => {
    const { selectedDate, username, email } = req.body;
    const date = new Date(selectedDate);
  
    if (!selectedDate || !username || !email) {
      return res.status(400).json({ message: "Username and Email are missing" });
    }
  
    if (!isAllowedDate(date)) {
      return res.status(400).json({ message: "Selected date is not allowed. Please choose a Friday, Saturday, or Sunday." });
    }
  
    try {
        const existingInterview = await SheduleInterview.findOne({ username, email, interviewDate: date.toISOString() });
        if (existingInterview) {
            return res.status(400).json({ message: "You have already booked this slot. Please choose another date and time." });
        }
  
        const bookingID = generateUniqueBookingID();
  
        const setInterviewDate = new SheduleInterview({
            interviewDate: date.toISOString(),
            username: username,
            email: email,
            bookingID: bookingID // Assuming you have this field in your schema
        });
  
        const storeData = await setInterviewDate.save();
  
        // Send email with booking ID
        const emailText = `Your interview is scheduled on ${date.toDateString()} with booking ID: ${bookingID}`;
        try {
            await sendEmail(email, 'Interview Scheduled', emailText);
            res.status(200).json({ message: "Successfully Interview Scheduled" });
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            res.status(500).json({ message: 'Failed to send confirmation email' });
        }
    } catch (error) {
        console.error('Error saving interview date:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.CheckBookingID = async (req, res) => {
  const { bookingID } = req.params;
  console.log(typeof(bookingID), "testid");
  console.log(bookingID);
  
  try {
    const interview = await SheduleInterview.findOne({ bookingID: bookingID });
    console.log(interview, "interview");

    if (interview) {  
      // Delete the found interview
      await SheduleInterview.deleteOne({ bookingID: bookingID });
      return res.status(200).json({ match: true });
    } else {
      return res.status(404).json({ match: false });
    }
  } catch (error) {
    console.error('Error checking booking ID:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}




  exports.getInterviewDate = async (req, res) => {
    const { username, email } = req.body;
  
    if (!username || !email) {
      return res.status(400).json({ message: 'Username and email are required' });
    }
  
    try {
      const interview = await SheduleInterview.findOne({ username, email });
  
      if (interview) {
        res.status(200).json({ interviewDate: interview.interviewDate });
      } else {
        res.status(404).json({ message: 'No interview scheduled' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  





  exports.AiService = async (req, res) => {
    console.log(req.body);

    try {
        const userInput = req.body.responses; // Extract the user's message from the request body
        console.log(userInput, "user data");

        // Prepare the message to send to the Gemini AI API
        const formattedMessage = `
            {
                "responses": ${JSON.stringify(userInput , null, 2)}
            }

            Note:
            Gemini, please analyze each question and answer pair provided in the JSON format accurately. Your task is to:
            1. Provide a score out of 100 based on the correctness and completeness of the answers.
            2. Identify the strengths of the answers, focusing on the user's knowledge and skills.
            3. Identify the weaknesses, pointing out any inaccuracies, incomplete answers, or lack of detail.
            4. Provide tips on how to improve the answers effectively and deeply.
            Please ensure your analysis is accurate and concise. This is for theory questions only, not coding examples.
            5. Don't type all the questions and answers score separately, just tell me the total overall scores with strengths, weaknesses, and improvement tips (in mostly 3 to 4 lines).
        `;

        // Send the user's message to the Gemini AI API
        const bardApiResponse = await axios.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
            contents: [
                {
                    parts: [
                        {
                            text: formattedMessage
                        }
                    ]
                }
            ]
        }, {
            params: {
                key: process.env.GEMINI_API_KEY // Replace with your actual Bard AI API key
            }
        });

        const responseData = bardApiResponse.data;
        const text = responseData.candidates[0].content.parts[0].text;

        console.log(text);

        // Send the entire response text back to the client
        res.json({ analysis: text });
    } catch (error) {
        console.error('Error handling Bard AI request:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

