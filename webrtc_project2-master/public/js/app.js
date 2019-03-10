const getip = Handlebars.compile($('#ipget').html());
var s=1;

//var socket1 = io();
window.addEventListener('load', () => {
  // Chat platform

  const chatTemplate = Handlebars.compile($('#chat-template').html());
  const chatContentTemplate = Handlebars.compile($('#chat-content-template').html());
  const chatEl = $('#chat');
  const formEl = $('.form');
  const messages = [];
  let username;
  //canvas
  var c = document.getElementById("myCanvas");
  var ctx = c.getContext("2d");
  // Local Video
  const localImageEl = $('#local-image');
  const localVideoEl = $('#local-video');
  const canvass = $('#myCanvas');
  const roomiframem = $('#roomiframe');
  var theListt = $('#theList');
  const iframee = $('#crop');
  const myfromm = $('#myfrom');
  // local canvas
  //const locaCanvasE1 = $('#myCanvas');
	var state3;
	var roomName3;
	var userName3;
  var iframelist = [];
  const num = 0;
  // Remote Videos
  const remoteVideoTemplate = Handlebars.compile($('#remote-video-template').html());
  const remoteVideosEl = $('#remote-videos');
  let remoteVideosCount = 0;

  // Hide cameras until they are initialized
  roomiframem.hide();
  localVideoEl.hide();
  canvass.hide();
  iframee.hide();
  myfromm.hide();
  theListt.hide();
  // Add validation rules to Create/Join Room Form
  formEl.form({
    fields: {
      roomName: 'empty',
      username: 'empty',
	    theme: 'empty'
    },
  });
	socket.on('back', function(state,roomName,username){
		state3=state;
		roomName3=roomName;
		username3=username;
	});
  // create our webrtc connection
  const webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold "our" video
    localVideoEl: 'local-video',
    // canvas
    //locaCanvasE1: 'myCanvas',
    // the id/element dom element that will hold remote videos
    remoteVideosEl: 'remote-videos',
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false,
  });
 // authorize
 /*
 var t = document.cookie.split('; ').find(function(element) {
     return element.includes("accesstoken") == true;
 });

 axios.get('http://'+location.hostname+ '/api/hello/',{ headers: { Authorization:"Bearer "+  t.split("=").pop()} })
     .then((response)=> {

         console.log(response.data) //使用者資料

     })
     .catch(function (error) {
         console.log("Get User Autherrize error"+ error);
 });
 */
  // We got access to local camera
  webrtc.on('localStream', () => {
    localImageEl.hide();
    localVideoEl.show();
    //localCanvaE1.show();
  });

  // Remote video was added
  webrtc.on('videoAdded', (video, peer) => {
    // eslint-disable-next-line no-console
    const id = webrtc.getDomId(peer);
    const html = remoteVideoTemplate({ id });
    /*
    if (remoteVideosCount === 0) {
      remoteVideosEl.html(html);
    } else {
      remoteVideosEl.append(html);
    }
    */
    remoteVideosEl.append(html);
    $(`#${id}`).html(video);
    remoteVideosCount += 1;
  });

  // Update Chat Messages
  const updateChatMessages = () => {
    const html = chatContentTemplate({ messages });
    const chatContentEl = $('#chat-content');
    chatContentEl.html(html);
    // automatically scroll downwards
    const scrollHeight = chatContentEl.prop('scrollHeight');
    chatContentEl.animate({ scrollTop: scrollHeight }, 'slow');
  };

  // Post Local Message
  const postMessage = (message) => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString('en-GB'),
    };
    // Send to all peers
    webrtc.sendToAll('chat', chatMessage);
    // Update messages locally
    messages.push(chatMessage);
    $('#post-message').val('');
    updateChatMessages();
  };

  // Display Chat Interfaces
  const showChatRoom = (room) => {
    roomiframem.hide();
    canvass.show();
    myfromm.show();
    iframee.show();
    formEl.hide();
    const html = chatTemplate({ room });
    chatEl.html(html);
    const postForm = $('form');
    postForm.form({
      message: 'empty',
    });
    $('#post-btn').on('click', () => {
      const message = $('#post-message').val();
      postMessage(message);
    });
    $('#post-message').on('keyup', (event) => {
      if (event.keyCode === 13) {
        const message = $('#post-message').val();
        postMessage(message);
      }
    });
	socket.on('Room2', function(state,roomName,username){//所有畫面一起清除
		state2=state;
		roomName2=roomName;
		username2=username;
		//console.log(username+" "+state+" "+roomName);
	});
  };

  // Register new Chat Room
  const createRoom = (roomName) => {
    // eslint-disable-next-line no-console
    //console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      //canvass.show();
      theListt.show();
      formEl.form('clear');
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
	  socket.emit('roomstate','Create',roomName,username,theme);
	  //console.log(username+" "+'Create'+" "+roomName);
	  if(roomName3!=null){
		console.log(roomName3);
	  }
    });
    //http://140.136.150.93:3000/note/mbkR5a/bk5jxe?p=frame
    var i=0;
    axios.get("http://140.136.150.93/upload/GET/notedrop/")
    .then((response)=>{
      for(i=0;i< response.data.length;i++){
        var value = response.data[i].noteid;
        console.log(response.data);
        var value2 = response.data[i].notelistid;
        var value3 = response.data[i].title;
        var url = "http://140.136.150.93:3000/note/"+value+"/"+value2+"?p=frame";
        theListt.append(new Option(value3,url));
      }
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
    //response.data[0].noteid
  };

  // Join existing Chat Room
  const joinRoom = (roomName) => {
    // eslint-disable-next-line no-console
    //console.log(`Joining Room: ${roomName}`);
    //canvass.show();
    //
    //
    webrtc.joinRoom(roomName);
    showChatRoom(roomName);
    postMessage(`${username} joined chatroom`);
	socket.emit('roomstate','Join',roomName,username,theme);
	//console.log(username+" "+'join'+" "+roomName);
  };

  // Receive message from remote user
  webrtc.connection.on('message', (data) => {
    if (data.type === 'chat') {
      const message = data.payload;
      messages.push(message);
      updateChatMessages();
    }
  });


  // Room Submit Button Handler
  $('.submit').on('click', (event) => {
    if (!formEl.form('is valid')) {
      return false;
    }
    username = $('#username').val();
    var t = document.cookie.split('; ').find(function(element) {
    return element.includes("accesstoken") == true;
    });
    console.log(t);
    axios.get('http://'+location.hostname+ '/api/hello/',{ headers: { Authorization:"Bearer "+  t.split("=").pop()} })
    .then((response)=> {

        console.log(response.data[0].username); //使用者資料
        username = response.data[0].username;
    })
    .catch(function (error) {
        console.log("Get User Autherrize error"+ error);
      });
	  theme = $('#theme').val();

    const roomName = $('#roomName').val().toLowerCase();
    if (event.target.id === 'create-btn') {
      createRoom(roomName);
    } else {
      joinRoom(roomName);
    }
    return false;
  });
});

function printurl(index){
    $('#crop').remove();
    var context = { "ip" : index};
    var html = getip(context);
    $('#sideBside').append(html);
    console.log(index);
    socket.emit('iframeroom',index);
}
socket.on('iframeget', function(index){
  $('#crop').remove();
  var context = { "ip" : index};
  var html = getip(context);
  $('#sideBside').append(html);
  console.log(index);
  io.in(roomName).emit('iframeroom',index);
});
function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
    $('#myInput').show();
    $('#adddrop').show();
    var myDropdownn = $('#myDropdown');
    $("#adddrop").empty();
    var i=0;
    var k=0;
    var flag = 1;
    axios.get("http://140.136.150.93/upload/GET/notedrop/")
    .then((response)=>{
      for(i=0;i< response.data.length;i++){
        var value = response.data[i].noteid;
        //console.log(response.data);
        var value2 = response.data[i].notelistid;
        var value3 = response.data[i].title;
        var url = "http://140.136.150.93:3000/note/"+value+"/"+value2+"?p=frame";
        Option.onclick = printurl(value);
        $('#adddrop').append(new Option(value3,url));
        $('#adddrop').on('click','option',function(){
          printurl(this.value);
          console.log(this.value);
          $('#adddrop').hide();
          $('#myInput').hide();
        });
        //myDropdownn.append(new Option(value,url));
      }
      console.log(response.data);
    })
    .catch(function (error) {
      console.log(error);
    });
    // iframe to canvas
    var myIframe = 'http://140.136.150.93:3000/note/9av2ma/ej2Dle?p=frame';
    iframe2image(myIframe,cb);
}
// iframe to canvas
/*
var inner = document.getElementById('crop');
iframe2image(inner, function (err, img) {
 // If there is an error, log it
 if (err) { return console.error(err); }
 // Otherwise, add the image to the canvas
 console.log(img);
 ctx.drawImage(img, 0, 0);
 });
*/
function showroom(){
  $('#roomiframe').toggle();
}
function filterFunction() {
    var input, filter, ul, li, a, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    div = document.getElementById("myDropdown");
    a = div.getElementsByTagName("option");
    for (i = 0; i < a.length; i++) {
        if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
            a[i].style.display = "";
        } else {
            a[i].style.display = "none";
        }
    }
}
