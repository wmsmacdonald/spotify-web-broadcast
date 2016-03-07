$(function() {
  $.ajax({
    url: '/playlist',
    success: receivedTracks
  });


});

function receivedTracks(tracks) {
  console.log(tracks);
  var tracksTable = $('#tracksTable');
  for (var i = 0; i < tracks.length; i++) {
    var element = '<tr data-trackUri="'+ tracks[i].uri + '" class="trackRow">' +
      '<td>' + tracks[i].name + '</td>' +
      '<td>' + tracks[i].artists.join(', ') + '</td>' +
      '</tr>';
    tracksTable.append(element);
  }

  $('.trackRow').click(function() {
    var trackUri = $(this).attr('data-trackUri');
    console.log(trackUri);
    $('#audio').attr('src', '/song?uri=' + trackUri);
  });
}

