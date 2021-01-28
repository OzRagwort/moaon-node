var pubSubHubbub = require("./pubsubhubbub"),
    crypto = require("crypto"),
    convert = require("xml-js"),
    async = require("async"),
    fs = require("fs"),

    callbackInfoFile = fs.readFileSync('./secret/callbackServerInfo.json', 'utf8'),
    callbackInfoJson = JSON.parse(callbackInfoFile);

    pubsub = pubSubHubbub.createServer({
        callbackUrl: `${callbackInfoJson.host}:${callbackInfoJson.port}`,
        secret: `${callbackInfoJson.secret}`
    });

pubsub.listen(`${callbackInfoJson.port}`);

pubsub.on("denied", function(data){
    console.log("Denied");
    console.log(data);
});

pubsub.on("subscribe", function(data){
    console.log("Subscribed " + data.topic+" to " + data.hub);
});

pubsub.on("unsubscribe", function(data){
    console.log("Unsubscribed " + data.topic + " from " + data.hub);
});

pubsub.on("error", function(error){
    console.log("Error message : ");
    console.log(error);
});

pubsub.on("listen", async function() {
  console.log("Server listening on port %s", pubsub.port);
});
