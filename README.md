# Web Based Rating Tool

## Native Flash Radio

We're currently using [Native Flash Radio](http://native.flashradio.info/) a proprietary browser based standalone HTML5 MP3 radio FM stream plugin player in the third generation, playing all MPEG-Audio streams. It is written in JavaScript compatible with iOS, Android and supports all browsers Firefox, Chrome, Safari, IE and Opera. It works responsive and allows to rapidly weave cross platform radio stream into your web pages. (HTML5 audio element with Flash fallback). It can grab and display "Now Playing" song information on the player as streamTitle for Shoutcast 1 + 2 and Icecast 1 + 2 Streams.

## Rating Component

In addition we would like our listeners to be able to rate the song (1 to 5 stars) currently playing based on different criteria. The rating component will be independent of the Native Flash Radio component grabing the song information on its own. 

* Song information will be read every 20 seconds (configurable)
* As soon as there's a new song, the song information will be reset
* Clicking on one of the 5 stars will write that value into a database (which will be accessible not only by the web-based rating tool, but also by our mobile apps)

## Rating Criteria

* Overall Rating
* Audio Quality
* Musical Expertise

It would also be very helpful to have a text area for comments, but this might also be considered for a later version.

## Roadmap

* Version 0.8 Alpha (March 2016)
* Version 0.9 Beta (April 2016)
* Version 1.0 Final (to be discussed)
