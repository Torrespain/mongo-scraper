
$(document).on("click", "#loadArticles", function(event){
	event.preventDefault(event);
	var articleCounter=0;
	$.ajax({
		method: "GET",
		url: "/scrape"
	})
	.done(function(){
		console.log("It worked! appending articles...");
		$.getJSON("/articles", function(data) {
 			// For each one
 			for (var i = 0; i < data.length; i++) {
    		// Display the apropos information on the page
    			$("#articles").append("<div class = 'articleHolder'><p data-id='" + data[i]._id + "'>" + "<span class = 'title'>" + data[i].title + "</span><br />"  + "<span class = 'body'>" + data[i].body + "</span><br/>" + "<span class = 'link'>" + data[i].link + "</span></p>" + "<button id='saveArticle' data-id='" + data[i]._id + "'>" + "save article" + "</button>"+"</div.");
    			articleCounter++;
 			}
 			alert(articleCounter + " new articles");
		});
	});
});


$(document).on("click", "#saveArticle", function() {
	var thisId = $(this).attr("data-id");
	alert("Article saved!");
	console.log(thisId);
	//grabbing the id from the button, making an ajax call to access the db from the server using the saved id
	$.ajax({
		method: "GET",
		url: "/savedArticles",
		data: {
			id: thisId
		}
	});

})




// $(document).on("click", "#savenote", function() {
// 	var thisId = $(this).attr("data-id");
// 	console.log(thisId);

// 	$.ajax({
// 		method: "POST",
// 		url: "/articles" + thisId,
// 		data: {
// 			title: $("#")
// 		}

// 	});

// })