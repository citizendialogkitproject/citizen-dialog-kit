function loadDisplays() { // GET ALL THE DISPLAYS for OVERVIEW
  $.get( "http://centos7.architectuur.kuleuven.be/api/display", function( display ) {
  console.log(display);
  var cardStart = '<div class="card mb-3" style="max-width: 18rem;"><div class="card-header">Display</div><div class="card-body"><h5 class="card-title">Display info</h5><p class="card-text">';
  var cardEnd = '</p></div></div>';
  for (var i = 0; i < display.length; i++) {
    var lastSeen = display[i].last_seen_at;
    var hasImage = display[i].image_handle;
    if(!lastSeen){
      var dateSeen = 'Not seen';
      var timeSeen =' yet...';
    }else{
      var dateSeen = lastSeen.split("T")[0]+' at ';
      var timeSeen = lastSeen.split("T")[1];
      timeSeen = timeSeen.split(".")[0];
    }
    if(!hasImage){
      hasImage = "No";
      var image = '<img src="design/images/blank.png" alt="display preview"/>'
    }else{
      var image = '<img src="http://centos7.architectuur.kuleuven.be/api/image/'+display[i].image_handle+'/original" alt="display preview"/>'
    }
    $('.displaysList').append('<div class="displayItem">'+image+'<ul><li>'+display[i].description+'</li><li><img src="design/images/seen.png" alt=""/>'+dateSeen+timeSeen+'</li><li><img src="design/images/type.png" alt=""/>'+display[i].screen_type+'</li></ul><a href="editDisplay.html?handle='+display[i].handle+'">Display Info</a><a href="displayContent.html?handle='+display[i].handle+'">Plan Content</a></div>');
    // <li><img src="design/images/description.png" alt=""/> </li>
  }
});
}

function getDisplayinfo() { // GET ONE DISPLAY TO EDIT
  var handle = getUrlParameter('handle');
  var url = "http://centos7.architectuur.kuleuven.be/api/display/"+handle;
  $.get(url , function( display ) {
    // insert info into form
    $('#displayID').val(display.serial);
    $('#displayDescr').val(display.description);
    $('#displayType').val(display.screen_type)
  });
}

function createDisplay(){ // CREATE A NEW DISPLAY
  event.preventDefault();
  var displayInfo = $('.displayInfo').serializeArray();
  var values = {};
  $(displayInfo ).each(function(index, obj){
      values[obj.name] = obj.value;
  });
  var username = "", //check api configuration
      pass = "";

  $.ajax({
    type: 'POST',
        url: 'https://centos7.architectuur.kuleuven.be/api/display',
        data: JSON.stringify(values),
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: {
          "Authorization": "Basic " + btoa(username + ":" + pass)
        },
        success: function(data) {
            console.log(data);
            $('.cancelbutton').hide();
            $('.addForm').slideUp();
            $('.failed').hide();
            $('.success').slideDown();
        },
        error: function(xhr, textStatus, errorThrown){
          $('.failed').slideDown();
        }
  });
}
function updateDisplay(){ // UPDATE A DISPLAY's INFO
  event.preventDefault();
  var displayInfo = $('.displayInfo').serializeArray();
  var values = {};
  $(displayInfo ).each(function(index, obj){
      values[obj.name] = obj.value;
  });
  var username = "", //check api configuration
      pass = "";
  var handle = getUrlParameter('handle');
  var puturl = "http://centos7.architectuur.kuleuven.be/api/display/"+handle;

  $.ajax({
    type: 'PUT',
        url: puturl,
        data: JSON.stringify(values),
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: {
          "Authorization": "Basic " + btoa(username + ":" + pass)
        },
        success: function(data) {
            console.log(data);
            $('.cancelbutton').hide();
            $('.addForm').slideUp();
            $('.failed').hide();
            $('.success').slideDown();
        },
        error: function(xhr, textStatus, errorThrown){
          $('.failed').slideDown();
        }
  });
}

function getDisplayContent(){
  var handle = getUrlParameter('handle');
  var url = "http://centos7.architectuur.kuleuven.be/api/display/"+handle;
  $.get(url , function( display ) {
    $('#imageType').val(display.screen_type)
    var imgsrc = "http://centos7.architectuur.kuleuven.be/api/image/"+display.image_handle+"/original";
    $('.currentImage img').attr("src", imgsrc);
    var imageInfo = "http://centos7.architectuur.kuleuven.be/api/image/"+display.image_handle;
    $.get(imageInfo , function( image ) {
      $('.curImageInfo').append("<ul><li>Name: "+image.name+"</li><li>Description: "+image.description+"</li></ul>");
    })
  });
}

function deleteDisplay(){
  event.preventDefault();
  var username = "", //check api configuration
      pass = "";
  var handle = getUrlParameter('handle');
  var deleteUrl = 'https://centos7.architectuur.kuleuven.be/api/display/'+handle;
  $.ajax({
    type: 'DELETE',
        url: deleteUrl,
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: {
          "Authorization": "Basic " + btoa(username + ":" + pass)
        },
        success: function(data) {
            console.log(data);
            $('.cancelbutton').hide();
            $('.deletebutton').hide();
            $('.addForm').slideUp();
            $('.failed').hide();
            $('.success2').slideDown();
            $('.success').hide();
        },
        error: function(xhr, textStatus, errorThrown){
          $('.failed').slideDown();
        }
    })
}

$( '#uploadimage' ).click( function () {
      event.preventDefault();
      $( '#uploadimage' ).attr('disabled',true).innerHTML = 'Please Wait...';
      var form_data = new FormData();
      jQuery.each(jQuery('#inputGroupFile01')[0].files, function(i, file) {
          form_data.append('data', file);
      });

        var username = "", //check api configuration
            pass = "";
        var imageInfo = $('.imageInfo').serializeArray();
        var values = {};
        $(imageInfo ).each(function(index, obj){
            values[obj.name] = obj.value;
        });
        $.ajax({
          type: 'POST',
              url: 'https://centos7.architectuur.kuleuven.be/api/image',
              data: JSON.stringify(values),
              contentType: "application/json; charset=utf-8",
              async: false,
              headers: {
                "Authorization": "Basic " + btoa(username + ":" + pass)
              },
              success: function(data2) {
                  var newImage = data2.handle;
                  //console.log(newImage);
                  var postImage = 'https://centos7.architectuur.kuleuven.be/api/image/'+newImage+'/original';
                  $.ajax({
                    type: 'POST',
                        url: postImage,
                        data: form_data,
                        cache: false,
                        contentType: false,
                        processData: false,
                        async: false,
                        headers: {
                          "Authorization": "Basic " + btoa(username + ":" + pass)
                        },
                        success: function() {
                          var thisDisplay = getUrlParameter('handle');
                          var imageToPut = {'handle': String(newImage)};
                            $.ajax({
                              type: 'PUT',
                                  url: 'https://centos7.architectuur.kuleuven.be/api/display/'+thisDisplay+'/image',
                                  data: JSON.stringify(imageToPut),
                                  contentType: "application/json; charset=utf-8",
                                  async: false,
                                  headers: {
                                    "Authorization": "Basic " + btoa(username + ":" + pass)
                                  },
                                  success: function() {
                                      $('.cancelbutton').hide();
                                      $('.currentImage').hide();
                                      $('.imageInfo').slideUp();
                                      $('.failed').hide();
                                      $('.success').slideDown();
                                  },
                                  error: function(xhr, textStatus, errorThrown){
                                    //console.log("error3 "+errorThrown);
                                    $('.imageInfo').slideUp();
                                    $('.failed').show();
                                  }
                            });
                        },
                        error: function(xhr, textStatus, errorThrown){
                          $('.imageInfo').slideUp();
                          $('.failed2').show();
                        }
                  });
              },
              error: function(xhr, textStatus, errorThrown){
                //console.log("error "+textStatus);
                $('.failed2').show();
              }
        });
	} );



function setfilename(val){
    var fileName = val.split('\\').pop();
    $('.custom-file-label').html(fileName);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};
