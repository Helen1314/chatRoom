const express = require('express')
const app = express()
const path = require('path');
//将express服务器和http服务器结合
let server = require('http').Server(app)
app.use(express.static(path.resolve(__dirname,'../public')))
//引入socket
const io = require("socket.io")(server)
let clients = []
let friends = []
io.sockets.on('connection',(client)=>{
	console.log('有客户端连接')
	clients.push(client)
	//接收用户的信息
	client.on('message',(params)=>{
		switch(params.type){
			case 'online':{
				client.name = params.name;
				client.broadcast.emit('ON_LINE',{time:params.time,txt:'用户'+client.name+'加入群聊'})
				//发送在线的所有客户端
				friends.push(params.name)
				io.sockets.emit('broadcast',{friends})
				// console.log(params)
			};break;
			case 'content':{
				client.broadcast.emit('CONTENT',{user:client.name,txt:params.content})
			};break;
		}
	})
	client.on('disconnect',()=>{
		console.log("客户端退出",client.name)
		let index = friends.findIndex(v=>v===client.name)
		friends.splice(index,1)
		io.sockets.emit('broadcast',{friends})
		client.broadcast.emit('CLOSE',{time:new Date().toLocaleString(),txt:"用户"+client.name+"离开了群聊"})
	})

})


server.listen(8080,()=>{
	console.log('服务器启动')
})