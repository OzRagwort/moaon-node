var pubSubHubbub = require("./pubsubhubbub"),
    crypto = require("crypto"),

    pubsub = pubSubHubbub.createServer({
        callbackUrl: "exampleHost:examplePort",
        secret: "exampleSecret"
    });

pubsub.listen(1337);

pubsub.on("denied", function(data){
  console.log("Denied");
});

pubsub.on("subscribe", function(data){
  console.log("Subscribed");
});

pubsub.on("unsubscribe", function(data){
  console.log("Unsubscribed");
});

pubsub.on("error", function(error){
  console.log("Error");
});

pubsub.on("feed", function(data){
  console.log("Feed");
});

pubsub.on("listen", async function() {
  console.log("Server listening on port %s", pubsub.port);
});
