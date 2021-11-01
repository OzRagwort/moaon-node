var pubSubHubbub = require("./pubsubhubbub"),
    myServer = require("./moaonControls"),
    moment = require("moment"),
    mtz = require("moment-timezone"),
    crypto = require("crypto"),
    convert = require("xml-js"),
    async = require("async"),
    fs = require("fs"),
    schedule = require("node-schedule")

    callbackInfoFile = fs.readFileSync('./secret/callbackServerInfo.json', 'utf8'),
    callbackInfoJson = JSON.parse(callbackInfoFile);

pubsub = pubSubHubbub.createServer({
    callbackUrl: `${callbackInfoJson.host}:${callbackInfoJson.port}`
});

pubsub.listen(`${callbackInfoJson.port}`);

moment.tz.setDefault("Asia/Seoul");

pubsub.on("denied", function(data){
    console.log("[%s] Denied", moment().format('YYYY-MM-DD HH:mm:ss'));
    console.log(data);
});

pubsub.on("subscribe", function(data){
  console.log("[%s] Subscribed " + data.topic, moment().format('YYYY-MM-DD HH:mm:ss'));
});

pubsub.on("unsubscribe", function(data){
  console.log("[%s] Unsubscribed " + data.topic, moment().format('YYYY-MM-DD HH:mm:ss'));
});

pubsub.on("error", function(error){
  console.log("Error", moment().format('YYYY-MM-DD HH:mm:ss'));
  console.log(error);
});

pubsub.on("feed", function(data){
    var xmlToJson = convert.xml2json(data.feed, {compact: true, ignoreComment: true, spaces: 4});
    var json = JSON.parse(xmlToJson);

    if (json["feed"].hasOwnProperty("entry")) {
      // 생성, 수정
      var videoId = json["feed"]["entry"]["yt:videoId"]["_text"];
      myServer.updateVideoById(videoId);
  	} else if (json["feed"].hasOwnProperty("at:deleted-entry")) {
      // 삭제
      var videoId = json["feed"]["at:deleted-entry"]["_attributes"]["ref"].substr(9,11);
      myServer.deletevideoById(videoId);
  	}
});

pubsub.on("listen", function() {
  console.log("[%s] Start server", moment().format('YYYY-MM-DD HH:mm:ss'));
  subscribeChannels();
  var job = schedule.scheduleJob('0 0 3 * * *', function() {
    console.log("[%s] channel subscribe", moment().format('YYYY-MM-DD HH:mm:ss'));
    subscribeChannels();
  });
});

async function subscribeChannels() {
  // 서버에서 채널 정보 받아온 뒤 구독하는 코드
  var page = 0,
      size = 10,
      channels = "",
      topic = "",
      seedTopic = "https://www.youtube.com/xml/feeds/videos.xml?channel_id=",
      hub = "https://pubsubhubbub.appspot.com";

  do {
    channels = (await myServer.getChannels(page++, size)).response;

    for (var channel of channels) {
      if (channel.hasOwnProperty("channelId")) {
        topic = seedTopic + channel.channelId;
        pubsub.subscribe(topic, hub, function(err){
          if(err){console.log("[%s] %s -> Failed subscribing", moment().format('YYYY-MM-DD HH:mm:ss'), pubsub.topic);}
        });
      }
    }
    await sleep(2000);
  } while (channels != "");

}

function sleep(ms) {
  const wakeUpTime = Date.now() + ms
  while (Date.now() < wakeUpTime) {}
}
