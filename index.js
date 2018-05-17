/* ===================
   Import Node Modules
=================== */
const express = require('express'); // Fast, unopinionated, minimalist web framework for node.
const app = express(); // Initiate Express Application
const router = express.Router();
const mongoose = require('mongoose'); // Node Tool for MongoDB
const config = require('./config/database'); // Mongoose Config
const path = require('path'); // NodeJS Package for file paths
const authentication = require('./routes/authentication')(router);
const blogs = require('./routes/blogs')(router);
const bodyParser = require("body-parser");
const cors = require('cors');
const port = process.env.PORT || 8080;


// Database Connection
mongoose.Promise = global.Promise;
mongoose.connect(config.uri, (err) => {
  if (err) {
    console.log('Could NOT connect to database: ', err);
  } else {
    console.log('Connected to database: ' + config.db);
  }
});
//cors-biblioteka dlya perenapravlenia putei dlya korrektnoi rabot@ mejdu backend 'http://localhost:8080' i 'http://localhost:4200' frontend
app.use(cors({
  origin: 'http://localhost:4200'
}));

// Provide static directory for frontend
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.use('/authentication', authentication);
app.use('/blogs', blogs);

// Connect server to Angular 2 Index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/public/index.html'));
});

// Start Server: Listen on port 8080
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
