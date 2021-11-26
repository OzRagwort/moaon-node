# Youtube PubSubHubbub Callback Server

[Youtube Data API](https://developers.google.com/youtube/v3)는 `PubSubHubbub`을 이용하여 구독 알림을 받을 수 있다. 

원하는 채널을 구독하고 업로드/수정/삭제되는 영상을 실시간으로 확인하여 [애니멀봄 서버](https://github.com/OzRagwort/moaon-server)의 정보를 최신으로 유지한다.

**참고 사이트**
- Subscribe to Push Notifications : 
[Youtube Data API PubSubHubbub](https://developers.google.com/youtube/v3/guides/push_notifications)
- github : [PubSubHubbub github](https://github.com/pubsubhubbub/)
- Hub : [Google PubSubHubbub Hub](https://pubsubhubbub.appspot.com/)

---

## 서버의 기능 정리

- 구독한 채널에서 보내는 feed를 정상적으로 받는다.
- feed를 확인하여 영상 정보와 업로드/수정/삭제된 것인지 파악한다. 
- [애니멀봄 서버](https://github.com/OzRagwort/moaon-server)로 Request를 보내 영상을 추가/수정/삭제한다.
- 주기적으로 [애니멀봄 서버](https://github.com/OzRagwort/moaon-server)에서 채널 목록을 확인하여 새롭게 구독을 갱신한다. 

---

## 동작 정리

### 준비 단계
1. [node-pubsubhubbub](https://github.com/pubsubhubbub/node-pubsubhubbub)을 이용하여 feed를 받을 수 있는 NodeJS 서버를 구현
2. PubSubHubbub에서 나의 서버를 Callback 서버로 설정하고 원하는 채널의 ID를 이용하여 구독(Subscribe)함

### 동작 단계
1. 구독한 채널에서 영상을 업로드/수정/삭제 할 경우 나의 서버로 feed를 보내줌(pubsub.on("feed"))
2. 받은 feed를 이용하여 확인하여 영상이 업로드/수정인지 삭제인지 파악(pubsub.on("feed"))
   - feed.entry가 있으면 업로드/수정
   - feed.at:deleted-entry가 있으면 삭제

> - 업로드/수정인 경우 오는 신호
> 
> ```
> {
>   topic: '<https://www.youtube.com/xml/feeds/videos.xml?channel_id=구독한채널ID>',
>   hub: '<https://pubsubhubbub.appspot.com>',
>   callback: '<http://116.33.141.170:1337/?topic=https%3A%2F%2Fwww.youtube.com%2Fxml%2Ffeeds%2Fvideos.xml%3Fchannel_id%3DUC_GnwUUstyOZOrKHHARWD5g&hub=https%3A%2F%2Fpubsubhubbub.appspot.com>',
>   feed: XML feed data,
>   headers: {
>     host: '콜백서버IP:1337',
>     link: '<https://www.youtube.com/xml/feeds/videos.xml?channel_id=구독한채널ID>; rel=self, <http://pubsubhubbub.appspot.com/>; rel=hub',
>     'content-type': 'application/atom+xml',
>     'x-hub-signature': 'sha1=ba35d9a139c8dbbd79024ce132d333b058fca70b',
>     'cache-control': 'no-cache,max-age=0',
>     pragma: 'no-cache',
>     'content-length': '861',
>     connection: 'keep-alive',
>     accept: '*/*',
>     from: 'googlebot(at)googlebot.com',
>     'user-agent': 'FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)',
>     'accept-encoding': 'gzip,deflate,br'
>   }
> }
> 
> ```
> 
> - XML feed
> 
> ```
> <?xml version='1.0' encoding='UTF-8'?>
> <feed xmlns:yt="<http://www.youtube.com/xml/schemas/2015>" xmlns="<http://www.w3.org/2005/Atom>"><link rel="hub" href="<https://pubsubhubbub.appspot.com>"/><link rel="self" href="<https://www.youtube.com/xml/feeds/videos.xml?channel_id=구독한채널ID>"/><title>YouTube video feed</title><updated>2021-01-25T13:09:45.978575093+00:00</updated><entry>
>   <id>yt:video:영상ID</id>
>   <yt:videoId>영상ID</yt:videoId>
>   <yt:channelId>채널ID</yt:channelId>
>   <title>title</title>
>   <link rel="alternate" href="<https://www.youtube.com/watch?v=영상ID>"/>
>   <author>
>    <name>채널명</name>
>    <uri><https://www.youtube.com/channel/채널ID></uri>
>   </author>
>   <published>업로드 날짜</published>
>   <updated>수정된 날짜</updated>
>  </entry></feed>
> 
> ```
> 
> - 삭제인 경우 오는 신호
> 
> ```
> {
>   topic: 'https://www.youtube.com/xml/feeds/videos.xml?channel_id=구독한채널ID',
>   hub: 'https://pubsubhubbub.appspot.com',
>   callback: 'http://콜백서버IP:1337/?topic=https%3A%2F%2Fwww.youtube.com%2Fxml%2Ffeeds%2Fvideos.xml%3Fchannel_id%3DUC_GnwUUstyOZOrKHHARWD5g&hub=https%3A%2F%2Fpubsubhubbub.appspot.com',
>   feed: XML feed data,
>   headers: {
>     host: '콜백서버IP:1337',
>     link: '<https://www.youtube.com/xml/feeds/videos.xml?channel_id=구독한채널ID>; rel=self, <http://pubsubhubbub.appspot.com/>; rel=hub',
>     'content-type': 'application/atom+xml',
>     'x-hub-signature': 'sha1=5bdc8c113702d08f38e2b982f113bc3a0693d79f',
>     'cache-control': 'no-cache,max-age=0',
>     pragma: 'no-cache',
>     'content-length': '423',
>     connection: 'keep-alive',
>     accept: '*/*',
>     from: 'googlebot(at)googlebot.com',
>     'user-agent': 'FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)',
>     'accept-encoding': 'gzip,deflate,br'
>   }
> }
> ```
> 
> - XML feed
> 
> ```
> <?xml version='1.0' encoding='UTF-8'?>
> <feed xmlns:at="http://purl.org/atompub/tombstones/1.0" xmlns="http://www.w3.org/2005/Atom"><at:deleted-entry ref="yt:video:0W6HRjqHX7U" when="2021-01-25T13:08:42.904647+00:00">
>   <link href="https://www.youtube.com/watch?v=영상ID"/>
>   <at:by>
>    <name>채널명</name>
>    <uri>https://www.youtube.com/channel/채널ID</uri>
>   </at:by>
>  </at:deleted-entry></feed>
> ```
>

3. [애니멀봄 서버](https://github.com/OzRagwort/moaon-server)로 Request를 보내 영상을 추가/수정/삭제를 하여 영상 목록을 최신화 함
   - 업로드/수정인 경우 영상 ID : feed.entry.yt:videoId._text (moaonControls.updateVideoById(id))
   - 삭제인 경우 영상 ID : feed.at:deleted_entry._attributes.ref (moaonControls.deleteVideoById(id))

### 유지 단계
1. 구독을 한 뒤 시간이 지나면 자동으로 구독이 만료되기 때문에 주기적으로 서버에서 채널 목록을 확인하여 새롭게 구독을 갱신한다. (server.subscribeChannels())
