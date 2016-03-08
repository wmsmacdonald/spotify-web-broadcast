var lame = require('lame');
var Speaker = require('speaker');
var Spotify = require('spotify-web');
var express = require('express');
var path = require('path');
var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ port: 8080 });

var username = process.env.USERNAME;
var password = process.env.PASSWORD;
var playlist = process.argv[2];

var app = express();
app.use(express.static(__dirname + '/public'));

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
            res.send(tracks);
          }
        });
      }
    });
  });
});

app.get('/track', function(req, res) {
  res.set({ 'Content-Type': 'audio/mpeg3'});
  var uri = req.query.uri;

  Spotify.login(username, password, function (err, spotify) {
    if (err) throw err;

    spotify.get(uri, function (err, track) {
      if (err) throw err;
      console.log('Playing: %s - %s', track.artist[0].name, track.name);

        track.play()
          .pipe(res)
          .on('finish', function () {
            spotify.disconnect();
          });

    });
  });
});

app.listen(3000);

var id = 0;
var clients = {};

wss.on('connection', function connection(ws) {
  ws.id = id++;
  clients[ws.id] = ws;

  console.log('ws client connected');
  ws.on('message', function(trackUri) {
    var clientIds = Object.keys(clients);

    for (var i = 0; i < clientIds.length; i++) {
      clients[clientIds[i]].send(trackUri);
    }
  });

  ws.on('close', function() {
    delete clients[ws.id];
  });
});