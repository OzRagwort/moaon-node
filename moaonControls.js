const http = require("http"),
      async = require("async"),
      fetch = require("node-fetch"),

      fs = require("fs"),
      serverInfoFile = fs.readFileSync('./secret/moaonServerInfo.json', 'utf8'),
      serverInfoJson = JSON.parse(serverInfoFile),

      serverUri = `${serverInfoJson.host}:${serverInfoJson.port}`;

module.exports = {
  // 전체 채널 정보 가져오기
  getChannels(page, size) {
    var uri = `${serverUri}${serverInfoJson.pathChannels}?page=${page}&maxResults=${size}`;
    return getData(uri);
  }

}

function getData(uri) {
  return fetch(uri)
    .then(res => res.json())
    .then(json => {return json;});
}
