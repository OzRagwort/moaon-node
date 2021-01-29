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
  },

  // 영상 정보 save
  postvideoById(id) {
    var uri = `${serverUri}${serverInfoJson.pathYtVideos}`;
    return postVideo(id, uri);
  },

  // 영상 정보 delete
  deletevideoById(id) {
    var uri = `${serverUri}${serverInfoJson.pathVideos}/${id}`;
    return deleteVideo(uri);
  },

  // 비디오 가져오기
  getVideos(id) {
    var uri = `${serverUri}${serverInfoJson.pathVideos}/${id}`;
    return getData(uri);
  },

  // 특정 카테고리의 채널 정보 가져오기
  getChannelsByCategory(category, page, size) {
    var uri = `${serverUri}${serverInfoJson.pathChannels}?category=${category}&page=${page}&maxResults=${size}`;
    return getData(uri);
  }

}

function getData(uri) {
  return fetch(uri)
    .then(res => res.json())
    .then(json => {return json;});
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
    .then(res => res.text())
    .then(json => {return json;});
}

function deleteVideo(uri) {
  return fetch(uri, {
    method: 'DELETE',
  })
    .then(res => res.text())
    .then(json => {return json;});
}
