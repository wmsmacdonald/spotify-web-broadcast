$(function() {
  $.ajax({
    url: '/playlist',
    success: receivedTracks
  });
});

function receivedTracks(tracks) {
  var tracksDiv = $('#tracks');
  for (var i = 0; i < tracks.length; i++) {
    var element = '<button data-trackUri="'+ tracks[i].uri + '" class="trackButton">' +
      tracks[i].name + '</button><br/>';
    tracksDiv.append(element);
  }

  $('.trackButton').click(function() {
    var trackUri = $(this).attr('data-trackUri');
    ws.send(trackUri);
  });
}

var ws = new WebSocket('ws://localhost:5340');

ws.onopen = function() {
  ws.onmessage = function(message) {
    changeTrack(message.data);
  };
};


function changeTrack(trackUri) {
  $('#audio').attr('src', '/track?uri=' + trackUri);
}