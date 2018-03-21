var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

//For Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
 
app.get('/', function (req, res) {
    res.render('index');
});

app.get('/savedArticles', function (req, res) {
    res.render('savedArticles');
});

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json({ type: "application/json" }));


// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
// mongoose.Promise = Promise;
// mongoose.connect("mongodb://localhost/as", {
//   // useMongoClient: true
// });


//conecting to Heroku
var databaseUrl = 'mongodb://localhost/as';

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI);
}
else {
  mongoose.Promise = Promise;
  mongoose.connect(databaseUrl);
};

mongoose.Promise = Promise;
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/as";
mongoose.connect(MONGODB_URI);
var database = mongoose.connection;

// A GET route for scraping the website
app.get("/scrape", function(req, res) {
	//grab the body of the html with request
	axios.get("https://en.as.com/en/").then(function(response){
		//load that into cheerio and save it to $ for a shorthand selector
		 var $ = cheerio.load(response.data);

		 $("div.pntc-content").each(function(i, element){
		 	//getting the tittle and the link

		 	var title = $(this).find(".pntc-txt").find("hgroup").find(".title").text();
		 	var link = $(this).find(".pntc-txt").find("hgroup").find(".title").find("a").attr("href");
		 	var body = $(this).find(".pntc-txt").find("p.txt").text();

		 	var result = {title, link, body};
		 	console.log(result);
		 	// check if Artilce has data
		 	// check if data is already in db do not create if its a duplicate
			db.Article
				.create(result)
				.then(function(dbArticle){
				//save the Article, send a message to the client
				
				 res.send("Scrape Complete");
				})
				.catch(function(err){
					// If an error occurred, send it to the client
					res.json(err);
				 });
		 });
	});
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article
    .find({}).limit( 15 )
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article
    .findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


//updating a note and finding it by id in the db
app.post("/articles/:id", function(req, res){
	console.log(req.body);
	db.Note
		.create(req.body)
		.then(function(dbNote){
			return db.Article.findOneAndUpdate({_id: req.params.id}, { note: dbNote._id}, { new: true });
		})
		.then(function(dbArticle){
			res.json(dbArticle);
		})
		.catch(function(err){
			res.json(err);
		});
});

//saving a specific article into the DB

app.post("/savedArticles", function(req, res){
	var savedId = req.body.id;
	var savedArticle = {};
	console.log(savedId)
	// Grab the article with the matching id
    db.Article
    	.findOneAndUpdate({_id: savedId},{"saved": true})
      	.then(function(dbArticle) {
     	// If we were able to successfully find Articles, send them back to the client
        	console.log("updated")
          res.json(dbArticle);
        	
      	})
      	.catch(function(err) {
      	// If an error occurred, send it to the client
        res.json(err);
     })
});

//deleting a specific article from the DB

app.post("/deleteArticle", function(req, res){
  var deleteId = req.body.id;
  var deleteArticle = {};
  console.log(deleteId)
  // Grab the article with the matching id
    db.Article
      .findOneAndUpdate({_id: deleteId},{"saved": false})
        .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
          console.log("deleted!")
          res.json(dbArticle);
          // location.reload();  it is not reloading..
        })
        .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
     }) 
});

// Route for getting all Saved Articles from the db
app.get("/saved", function(req, res){
  console.log("before db.article")
  // Grab every document in the Articles collection
  db.Article
    .find({saved: true}).sort({createdAt: -1})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      console.log("before the render", dbArticle)
      res.render("savedArticles", {
        'articles': dbArticle
      } );
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});


app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});

