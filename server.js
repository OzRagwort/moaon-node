var pubSubHubbub = require("./pubsubhubbub"),
    myServer = require("./moaonControls"),
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
    console.log("Error");
    console.log(error);
});

pubsub.on("listen", async function() {
  console.log("Server listening on port %s", pubsub.port);
  subscribeChannels();
});

async function subscribeChannels() {
  // 서버에서 채널 정보 받아온 뒤 구독하는 코드
  var page = 1,
      size = 10,
      channels = "",
      seedTopic = "https://www.youtube.com/xml/feeds/videos.xml?channel_id=",
      hub = "https://pubsubhubbub.appspot.com";

  do {
    channels = await myServer.getChannels(page++, size);

    for (var channel of channels) {
      if (channel.hasOwnProperty("channelId")) {
        topic = seedTopic + channel.channelId;
      	pubsub.subscribe(topic, hub, function(err){
            if(err){console.log("%s Failed subscribing", pubsub.topic);}
        });
      }
    }
  } while (channels != "");

}
