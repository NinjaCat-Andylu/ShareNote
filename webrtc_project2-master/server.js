const axios = require('axios');

var express = require('express');
var fs = require('fs');
var app = express();
// add socket
var https = require('https');

var port = process.env.PORT ||3232;
var ip = '140.136.150.93';
// Set public folder as root

app.use(express.static('public'));

// Provide access to node_modules folder from the client-side
app.use('/scripts', express.static(`${__dirname}/node_modules/`));
//http://140.136.150.93/upload/index/
axios.get("http://140.136.150.93/upload/GET/notedrop/")
.then(function (response) {
  console.log(response.data);
})
.catch(function (error) {
  console.log(error);
});


// Redirect all traffic to index.html
app.use((req, res) => res.sendFile(`${__dirname}/public/index.html`));

// add socket

var roomidlist =[];
var themelist =[];
var statelist =[];
var userlist =[];
var max=1;

var i;

var server=https.createServer({
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
}, app).listen(port,ip,function ()  {
  console.info('listen on %s:%d',ip,port);
});

/*
var server=https.createServer(app).listen(port,ip,function ()  {
  console.info('listen on %s:%d',ip,port);
});
*/

var io = require('socket.io').listen(server);

io.on('connection', function (socket){
	var curRoomName  = "大廳";
	var room2;

    socket.on('certain', function(roomName){
		curRoomName = roomName;
    });
	socket.join(curRoomName);
	socket.on('roomlist', function(key){
		io.emit('Roomlist', roomidlist);
		io.emit('Roomlist3', roomidlist,themelist);
    });
	socket.on('roomstate', function(state,roomName,username,theme){
		statelist.push(state);
		socket.leave("大廳");
		for(i=0;i<=max;i++){
			if(roomidlist[i]==roomName){
				socket.emit('backjoin', state,roomName,username);
				break;
				}
			else if(i==max-1){
				roomidlist.push(roomName);
				userlist.push(username);
				themelist.push(theme);
				max=max+1;
				io.emit('Roomlist2', roomidlist);
				break;
			}
		}
		socket.join(roomName);
		socket.emit('back', state,roomName,username);
		io.in(roomName).emit('Room2', state,roomName,username);
		curRoomName = roomName;
		io.emit('Roomlist3', roomidlist,themelist);
		console.log(io.sockets.adapter.rooms[curRoomName]);
    });
	socket.on('drawing',function(data,list) {
		io.in(curRoomName).emit('drawing', data);
		io.in(curRoomName).emit('Room3', data);
		console.log(io.sockets.adapter.rooms[curRoomName]);
		io.emit('Roomlist3', roomidlist,themelist);
	});
	socket.on('pressed', function(key){
		io.in(curRoomName).emit('PlayersMoving', key);
		io.emit('Roomlist3', roomidlist,themelist);
    });
	socket.on('image',function(image2) {
		io.in(curRoomName).emit('image2', image2);
	});
  socket.on('iframeroom',function(index) {
		io.in(curRoomName).emit('iframeget', index);
    console.log(index+" "+curRoomName);
	});
	io.emit('Roomlist3', roomidlist,themelist);

	console.log("curent is "+curRoomName);
});


function isRoomExist (roomName, roomList) {
  return roomList[roomName] >= 0;
}
