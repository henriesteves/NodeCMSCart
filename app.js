const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const config = require('./config/database');

// Connect to db
mongoose.connect(config.database, { useMongoClient: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () =>  {
  console.log('Connected to Mongodb')
});

// Init app
const app = express();

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Set public folder
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
 res.render('index', {
   title: 'Home'
 });
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log('Server started on port ' + port);
});