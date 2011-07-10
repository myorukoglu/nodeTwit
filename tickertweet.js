//sandbox our little app
(function(){
	var twit   = require("TwitterCast");
	var topics = ["music","facebook","rootmusic","fencing"];
	
	//We'll keep out tweets here
	var tweets = [];

	//This is our simple object for holding our tweet info
	var createTweetRecord = function(created_at, text){
		return{
			date  : new Date(created_at),
			tweet : text
		}
	}

	//display our results
	var display = function(){
		//sort by date
		tweets.sort(function(a,b){
			return(a.date - b.date);
		});
		//loop the results
		tweets.forEach(function(item){
			console.log( item.date + " - " + item.tweet + "\n");
		});
		
		//all done so fire the event to start it all over again
		twit.TwitterCaster.Broadcaster.emit("TweetTweet");
		
	}

	//Event for when a tweet has been return
	twit.TwitterCaster.Broadcaster.on("tweeted", function (text, searchTerm) {
		var i = 0, 
			len = text.results.length;
		text.results.forEach(function(res){
			//set the tweet id to the last one to remove future duplicates
			if(res.id >  twit.TwitterCaster.last){
				twit.TwitterCaster.last = res.id;
			}
			tweets.push(createTweetRecord( res.created_at, searchTerm + ": " + res.text));
		});
		//all done remove the request from the counter
		twit.TwitterCaster.requests--;
		//fire the event 
		twit.TwitterCaster.Broadcaster.emit("requestComplete", twit.TwitterCaster.requests);
	});

	//Event to see if all of the requests are finished
	twit.TwitterCaster.Broadcaster.on("requestComplete", function(requestCount){
		if(requestCount === 0){
			if(tweets.length !== 0){
				display();
			}
			else{
				twit.TwitterCaster.Broadcaster.emit("TweetTweet");
			}
		}
	});


	//Event to see if all of the requests are finished
	twit.TwitterCaster.Broadcaster.on("TweetTweet", function(){
		//reset array for the next round of tweets
		tweets = [];
		twit.TwitterCaster.requests  	= 2;
		twit.SearchTwitter("music", 	twit.TwitterCaster);
		twit.SearchTwitter("facebook",  twit.TwitterCaster);
		//twit.SearchTwitter("rootmusic", twit.TwitterCaster);
		//twit.SearchTwitter("fencing",  	twit.TwitterCaster);
	});
	//start 
	twit.TwitterCaster.Broadcaster.emit("TweetTweet");
})();