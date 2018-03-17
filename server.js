var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
// var db = require("./models");

var PORT = 3000;


// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/populatedb2", {
  // useMongoClient: true
});

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
	//grab the body of the html with request
	axios.get("https://en.as.com/en/").then(function(response){
		//load that into cheerio and save it to $ for a shorthand selector
		 var $ = cheerio.load(response.data);

		 $("h2.title").each(function(i, element){
		 	//getting the tittle and the link

		 	var title = $(element).children("a").text();
		 	var link = $(element).children("a").attr("href");

		 	var result = {title, link};
		 	console.log(result);
		 });


	});

	// Send a "Scrape Complete" message to the browser
 	 res.send("Scrape Complete");
});


app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});