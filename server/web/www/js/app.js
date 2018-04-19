$('.dp').datetimepicker({
        showTodayButton: true,
                locale: 'nl-be',
        icons: {
                    time: "fa fa-clock",
                    date: "fa fa-calendar-alt",
                    up: "fa fa-chevron-up",
                    down: "fa fa-chevron-down"
                },
        toolbarPlacement: "bottom"
    }).on('dp.change',function(e){

        $(this).parents('.row')
           .find('.dp2')
           .data("DateTimePicker")
           .minDate(e.date);
    });

    $('.dp2').datetimepicker({
        showTodayButton: true,
                locale: 'nl-be',
        icons: {
                    time: "fa fa-clock",
                    date: "fa fa-calendar-alt",
                    up: "fa fa-chevron-up",
                    down: "fa fa-chevron-down"
                },
        toolbarPlacement: "bottom",
        useCurrent: false
    }).on('dp.change',function(e){
        $(this).parents('.row')
               .find('.dp')
               .data("DateTimePicker")
              .maxDate(e.date);
    });


  
function loadDisplays() { // GET ALL THE DISPLAYS for OVERVIEW
  $.get( "https://centos7.architectuur.kuleuven.be/api/display", function( display ) {
  console.log(display);
  // get all the tags that exist
  var tags = ['null'];
  var groups = [];
  for (var i = 0; i < display.length; i++) {
	if(display[i].tags != null){
		var theseTags = display[i].tags;
		theseTags = theseTags.split(",");
		for(var j = 0; j < theseTags.length; j++) {
			if(!tags.includes(theseTags[j])){
				tags.push(theseTags[j].replace(/\s+/g, ''));
			}
		}
	}
  }

//  console.log(tags);
  for (var i = 0; i < tags.length; i++) {
  	var group = [];
  	for(var j = 0; j < display.length; j++) {
		var theseTags = display[j].tags;
		if(theseTags == null){theseTags = "null"}
		theseTags = theseTags.split(",");
		for(var k = 0; k < theseTags.length; k++) {
			if(tags[i]==theseTags[k].replace(/\s+/g, '')){
				group.push({'tag': tags[i], 'handle': display[j].handle})
			}
		}
	}
	groups.push(group)
  }
//  console.log(groups)

  for (var i = 0; i < groups.length; i++) {
	  var thisgroup = groups[i];
	  if(thisgroup.length != 0){  
	   $('.displays').append("<h3>Tagged: "+thisgroup[0].tag+"</h3><hr><div class='displaysList displaysList"+i+"'></div>");
	  for(var j = 0; j < thisgroup.length; j++) {
	  	var datagood = _(display).find(function(x) {
		  return x.handle == thisgroup[j].handle;
		});
	  	
	  	
		var lastSeen = datagood.last_seen_at;
		    var hasImage = datagood.image_handle;
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
		      var image = '<img src="https://centos7.architectuur.kuleuven.be/api/image/'+datagood.image_handle+'/original" alt="display preview"/>'
		    }
		    $('.displaysList'+i).append('<div class="displayItem">'+image+'<ul><li>'+datagood.description+'</li><li><img src="design/images/seen.png" alt=""/>'+dateSeen+timeSeen+'</li><li><img src="design/images/type.png" alt=""/>'+datagood.screen_type+'</li><li><img src="design/images/tags.png" alt=""/>'+datagood.tags+'</li></ul><a href="editDisplay.html?handle='+datagood.handle+'">Display Info</a><a href="displayContent.html?handle='+datagood.handle+'">Plan Content</a></div>');
		    
	  }
	 }
  }
});
}

function getDisplayinfo() { // GET ONE DISPLAY TO EDIT
  var handle = getUrlParameter('handle');
  var url = "https://centos7.architectuur.kuleuven.be/api/display/"+handle;
  $.get(url , function( display ) {
    // insert info into form
    $('#displayID').val(display.serial);
    $('#displayDescr').val(display.description);
    $('#displayType').val(display.screen_type)
        $('#tags').val(display.tags)
  });
}

function createDisplay(){ // CREATE A NEW DISPLAY
  event.preventDefault();
  var displayInfo = $('.displayInfo').serializeArray();
  var values = {};
  $(displayInfo ).each(function(index, obj){
      values[obj.name] = obj.value;
  });
  var username = "",
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
  var username = "",
      pass = "";
  var handle = getUrlParameter('handle');
  var puturl = "https://centos7.architectuur.kuleuven.be/api/display/"+handle;

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
            $('.deletebutton').hide();
            $('.addForm').slideUp();
            $('.failed').hide();
            $('.success').slideDown();
        },
        error: function(xhr, textStatus, errorThrown){
          $('.failed').slideDown();
        }
  });
}
  $('.backButton').click(function(){
	  event.preventDefault();
	  window.history.back();
  })
function imageDetails(){
  var handle = getUrlParameter('handle');
  var url = "https://centos7.architectuur.kuleuven.be/api/image/"+handle;
  var scheduleUrl = "https://centos7.architectuur.kuleuven.be/api/image/"+handle+"/schedule";
  
  
  $.get(url , function( image ) {
	$.get(scheduleUrl , function( image_schedule ) {
		var schedule = image_schedule;
	    var imgsrc = "https://centos7.architectuur.kuleuven.be/api/image/"+image.handle+"/original";
		var img = '<img src="'+imgsrc+'" alt=""/>'
	    var imageVotes = "https://centos7.architectuur.kuleuven.be/api/image/"+image.handle+"/result";
	    
	    $('.curImageInfo').append('<div class="displayItem">'+img+'<ul><li>'+image.name+'</li><li><img src="design/images/seen.png" alt=""/>'+moment.unix(schedule[0].start).format("DD-MM-YYYY HH:mm")+'</li><li><img src="design/images/hidden.png" alt=""/>'+moment.unix(schedule[0].stop).format("DD-MM-YYYY HH:mm")+'</li></ul></div>')
	    
	    $('.current').html(image.name);
	      $.get(imageVotes , function( votes ) {
	        //console.log(votes);
	        var showVotes = [0 , 0 , 0 , 0, 0];
	        for (var i = 0; i < votes.length; i++) {
	          showVotes[0] = (showVotes[0]+ parseInt(votes[i].value.substring(2,6)));
	          showVotes[1] = (showVotes[1]+ parseInt(votes[i].value.substring(9,13)));
	          showVotes[2] = (showVotes[2]+ parseInt(votes[i].value.substring(16,20)));
	          showVotes[3] = (showVotes[3]+ parseInt(votes[i].value.substring(23,27)));
	          showVotes[4] = (showVotes[4]+ parseInt(votes[i].value.substring(30,34)));
	        }
	        //console.log(showVotes);
	        $('.curImageInfo ul').append("<li><img src='design/images/votes.png' alt=''/>Total votes: "+(showVotes[0]+showVotes[1]+showVotes[2]+showVotes[3]+showVotes[4])+"</li>");
	        var ctx = document.getElementById('pollingResults').getContext('2d');
	        var chart = new Chart(ctx, {
	            // The type of chart we want to create
	            type: 'bar',
	
	            // The data for our dataset
	            data: {
	                labels: ["Answer 1", "Answer 2", "Answer 3", "Answer 4", "Answer 5"],
	                datasets: [{
	                    label: "",
	                    backgroundColor: 'rgb(255, 99, 132)',
	                    borderColor: 'rgb(255, 99, 132)',
	                    data: showVotes
	                }]
	            },
	
	            // Configuration options go here
	        options: {
	                scales: {
	                    yAxes: [{
	                        ticks: {
	                            beginAtZero:true,
	                            stepSize: 1,
	                            callback: function(tickValue, index, ticks) {
	                              if(!(index % parseInt(ticks.length / 4))) {
	                                return tickValue
	                              }
	                            }
	                        }
	                    }]
	                },
	                legend: {
	                    display: false
	                },
	                sort: true
	            }
	        });
	      });
		});
    })
}

function getDisplayContent(){
  var handle = getUrlParameter('handle');
  
  var url_display = "https://centos7.architectuur.kuleuven.be/api/display/"+handle;
  var url_schedule = "https://centos7.architectuur.kuleuven.be/api/display/"+handle+"/schedule";
  
  $.get(url_display , function( display ) {
	    $('#imageType').val(display.screen_type)
	    $('.current').append("'"+display.description+"'");
	})

  $.get(url_schedule , function( schedule ) {
		var eventsList = [];
		for (var i = 0; i < schedule.length; i++) {
			var event = {'title': 'event'+i, 'start': moment.unix(schedule[i].start).format("YYYY-MM-DD[T]HH:mm:ss"), 'end':moment.unix(schedule[i].stop).format("YYYY-MM-DD[T]HH:mm:ss"), 'image_handle': schedule[i].image_handle, 'schedule_handle': schedule[i].handle, 'display_handle': handle};
			eventsList.push(event);
		}
		console.log(eventsList);
		$('#calendar').fullCalendar({
		  events: eventsList,
		  height: 500,
		  themeSystem: 'bootstrap4',
		  nowIndicator: true,
		  defaultView: 'agendaWeek',
		  locale: 'nl-be',
		  eventClick: function(calEvent, jsEvent, view) {
		    var detailurl = "https://centos7.architectuur.kuleuven.be/imagedetails.html?handle="+calEvent.image_handle+"&schedule="+calEvent.schedule_handle+"&display="+handle;
			window.location.href = detailurl;
		  }
		});
	});
  }
  
function deleteSchedule(){
  event.preventDefault();
  var username = "",
      pass = "";
      
  var schedule_handle = getUrlParameter('schedule');
  var display_handle = getUrlParameter('display');
  var deleteUrl = 'https://centos7.architectuur.kuleuven.be/api/schedule/'+schedule_handle;
  var backurl = "https://centos7.architectuur.kuleuven.be/displayContent.html?handle="+display_handle;
  
  $.ajax({
    type: 'DELETE',
        url: deleteUrl,
        contentType: "application/json; charset=utf-8",
        async: false,
        headers: {
          "Authorization": "Basic " + btoa(username + ":" + pass)
        },
        success: function(data) {
            window.location.replace(backurl)
        }
  });
}

function deleteDisplay(){
  event.preventDefault();
  var username = "",
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
      if($('#start').val()!= "" && $('#stop').val()!= ""){
	      $('.failed3').hide();
		$( '#uploadimage' ).attr('disabled',true).innerHTML = 'Please Wait...';
		      var form_data = new FormData();
		      jQuery.each(jQuery('#inputGroupFile01')[0].files, function(i, file) {
		          form_data.append('data', file);
		      });
		
		        var username = "",
		            pass = "";
		        var imageInfo = $('.imageInfo').serializeArray();
		        var values = {};
		        var create = {};
		        $(imageInfo ).each(function(index, obj){
		            values[obj.name] = obj.value;
		            create[obj.name] = obj.value;
		        });
				delete create.start;
				delete create.stop;
		        $.ajax({
		          type: 'POST',
		              url: 'https://centos7.architectuur.kuleuven.be/api/image',
		              data: JSON.stringify(create),
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
			                                  var startUnix = moment(values.start, "D/M/YYYY hh:mm").unix();
			                                  var stopUnix = moment(values.stop, "D/M/YYYY hh:mm").unix();
			                                  var schedule = {"display_handle": thisDisplay, "image_handle": newImage, "start": startUnix, "stop": stopUnix}
											  console.log(schedule);
			                                  $.ajax({
										          type: 'POST',
										              url: 'https://centos7.architectuur.kuleuven.be/api/schedule',
										              data: JSON.stringify(schedule),
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
					                                      $('#calendar').hide();
											          }
											  });
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
 
      }else{
	      $('.failed3').show();
      }
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
