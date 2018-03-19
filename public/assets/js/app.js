
$(document).on("click", "#loadArticles", function(event){
	event.preventDefault(event);
	var articleCounter=0;
	$.ajax({
		method: "GET",
		url: "/scrape"
	})
	.done(function(){
		console.log("hello!")
		$.getJSON("/articles", function(data) {
 			// For each one
 			for (var i = 0; i < data.length; i++) {
    		// Display the apropos information on the page
    			$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    			articleCounter++;
 			}
 			alert(articleCounter + " new articles")
	});

	})


})

