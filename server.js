var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var express = require('express');
var path = require('path');
//var uri = process.argv[2] || 'spotify:track:6tdp8sdXrXlPV6AZZN2PE8';
 
// Spotify credentials... 
var username = process.env.USERNAME;
var password = process.env.PASSWORD;

var app = express();
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res) {

});

app.get('/playlist', function(req, res) {
  Spotify.login(username, password, function (err, spotify) {
    if (err) throw err;

    uri = 'spotify:user:bearded_gecko:playlist:5g9jTHXGH74EpnflhaoSsF';
    spotify.playlist(uri, function (err, playlist) {
      if (err) throw err;

      //console.log(playlist);

      var trackUris = playlist.contents.items;
      var tracks = [];
      for (var i = 0; i < trackUris.length; i++) {
        var trackUri = trackUris[i].uri;

        spotify.get(trackUri, function (err, track) {
          if (err) throw err;

          var slimTrack = {
            name: track.name,
            artists: [],
            uri: track.uri
          };

          for (var i = 0; i < track.artist.length; i++) {
            slimTrack.artists.push(track.artist[i].name);
          }

          tracks.push(slimTrack);

          if (tracks.length === trackUris.length) {
            //console.log(tracks);
            res.send(tracks);
          }
        });
      }
    });
  });
});

app.get('/song', function(req, res) {
  var uri = req.query.uri;
  res.set({'Content-Type': 'audio/mp3'});
  Spotify.login(username, password, function (err, spotify) {
    if (err) throw err;

    spotify.get(uri, function (err, track) {
      if (err) throw err;
      console.log('Playing: %s - %s', track.artist[0].name, track.name);

      // play() returns a readable stream of MP3 audio data
      track.play()
        .pipe(res)
        .on('finish', function () {
          spotify.disconnect();
        });

    });
  });
});

app.listen(3000);
