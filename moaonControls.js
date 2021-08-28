const http = require("http"),
      async = require("async"),
      fetch = require("node-fetch"),
      moment = require("moment"),
      mtz = require("moment-timezone"),

      fs = require("fs"),
      serverInfoFile = fs.readFileSync('./secret/moaonServerInfo.json', 'utf8'),
      serverInfoJson = JSON.parse(serverInfoFile),

      serverUri = `${serverInfoJson.host}:${serverInfoJson.port}`;

moment.tz.setDefault("Asia/Seoul");

module.exports = {
  // 전체 채널 정보 가져오기
  getChannels(page, size) {
    var uri = `${serverUri}${serverInfoJson.pathChannels}?page=${page}&size=${size}`;
    return getData(uri);
  },

  // 영상 정보 save or update
  updateVideoById(id) {
    var videos = getVideos(id);
    videos.then((video) => {
      if (video.response == null) {
        // save
        var uri = `${serverUri}${serverInfoJson.pathUpdateVideos}`;
        postVideo(id, uri);
    	} else {
        // update (서버에서 자동으로 최신화 함)
        console.log("[%s] update => %s", moment().format('YYYY-MM-DD HH:mm:ss'), id);
      }
    });
  },

  // 영상 정보 delete
  deletevideoById(id) {
    var uri = `${serverUri}${serverInfoJson.pathVideos}/${id}`;
    deleteVideo(id, uri);
  }

}

function getData(uri) {
  return fetch(uri)
    .then(function(response) {
      return response.json();
    });
}

// 비디오 가져오기
function getVideos(id) {
  var uri = `${serverUri}${serverInfoJson.pathVideos}/${id}`;
  return getData(uri);
}

function postVideo(id, uri) {
  data = {"videoId":id};

  return fetch(uri, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data),
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      if (myJson.response == null) {
        console.log("[%s] save fail => %s", moment().format('YYYY-MM-DD HH:mm:ss'), id);
      } else {
        console.log("[%s] save => %s", moment().format('YYYY-MM-DD HH:mm:ss'), id);
      }
    });
}

function deleteVideo(id, uri) {
  return fetch(uri, {
    method: 'DELETE',
    headers: {
        'Content-Type': 'application/json'
    },
  })
    .then(function(response) {
      return response.json();
    })
    .then(function(myJson) {
      if (myJson.response == null) {
        console.log("[%s] delete fail => %s", moment().format('YYYY-MM-DD HH:mm:ss'), id);
      } else {
        console.log("[%s] delete => %s", moment().format('YYYY-MM-DD HH:mm:ss'), id);
      }
    });
}
