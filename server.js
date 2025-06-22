// Import required packages
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create the Express app
const app = express();

// Middleware setup
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // This lets Express serve the HTML/CSS/JS

// Basic route to check if server is running
//app.get('/', (req, res) => { 
  //res.send('Student Record System is running!');
//});//

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const mongoose = require('mongoose');

//Connect to MongoDB (replace URL if using Atlas)
// mongoose.connect('mongodb://localhost:27017/studentDB')
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

//24101440
//adminuser

const mongoUri = "mongodb+srv://adminuser:24101440@studentcluster.kpqlgf9.mongodb.net/studentDB?retryWrites=true&w=majority&appName=StudentCluster";
mongoose.connect(mongoUri,{});

const db = mongoose.connection;
db.on('error', console.error.bind(console, '❌ MongoDB connection error:'));
db.once('open', function() {
  console.log('✅ Connected to MongoDB');
});
// Uncomment the following line to connect to a local MongoDB instance


// mongoose.connect('mongodb+srv://admin:admin@123@cluster0.7irspg1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
// .then(() => console.log('✅ Connected to MongoDB'))
// .catch(err => console.error('❌ MongoDB connection error:', err));

const Student = require('./models/student');

// Insert a Student
app.post('/students', async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Show all Students
app.get('/students', async (req, res) => {
  try {
    const students = await Student.find();
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Find a Student by SID
app.get('/students/sid/:sid', async (req, res) => {
  try {
    const student = await Student.findOne({ SID: req.params.sid });
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by First Name
app.get('/students/firstname/:firstName', async (req, res) => {
  try {
    const students = await Student.find({ FirstName: req.params.firstName });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by Last Name
app.get('/students/lastname/:lastName', async (req, res) => {
  try {
    const students = await Student.find({ LastName: req.params.lastName });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by Email
app.get('/students/email/:email', async (req, res) => {
  try {
    const student = await Student.findOne({ Email: req.params.email });
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by Nearest City
app.get('/students/city/:city', async (req, res) => {
  try {
    const students = await Student.find({ NearCity: req.params.city });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by Course
app.get('/students/course/:course', async (req, res) => {
  try {
    const students = await Student.find({ Course: req.params.course });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Find Students by Guardian
app.get('/students/guardian/:guardian', async (req, res) => {
  try {
    const students = await Student.find({ Guardian: req.params.guardian });
    res.send(students);
  } catch (error) {
    res.status(500).send();
  }
});

// Update Student by SID
app.patch('/students/sid/:sid', async (req, res) => {
  try {
    const student = await Student.findOneAndUpdate(
      { SID: req.params.sid },
      req.body,
      { new: true }
    );
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Delete Student by SID
app.delete('/students/sid/:sid', async (req, res) => {
  try {
    const student = await Student.findOneAndDelete({ SID: req.params.sid });
    if (!student) {
      return res.status(404).send();
    }
    res.send(student);
  } catch (error) {
    res.status(500).send();
  }
});
