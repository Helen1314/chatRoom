import React, { Component } from 'react';
import './App.css';
//建立与socket服务器的连接
const socket = require('socket.io-client')('http://localhost:8080')
class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      friendList:[],
      chatList:[],
      userName:'',
      addInfo:[],
      myclose:false,
      fclose:false
    }
  }
  componentDidMount(){
    let name = window.prompt('请输入昵称');
    if(!name){
      name = Date.now()
    }
    this.setState({userName:name})
    //连接之后，给服务器发送昵称
    socket.emit('message',{type:'online',name,time:new Date().toLocaleString()})

    //接收服务器返回的朋友列表
    socket.on('broadcast',(msg)=>{
      this.setState({friendList:msg.friends})
      // console.log(this.state.friendList)
    })
    //新人上线
    socket.on('ON_LINE',(msg)=>{
      // console.log(msg)
      let newInfo = this.state.addInfo;
      newInfo.push(msg)
        this.setState({addInfo:newInfo})
    })
    //好友离开的消息提示
    socket.on('CLOSE',(msg)=>{
      // console.log(msg)
      let newInfo = this.state.addInfo;
      newInfo.push(msg)
        this.setState({addInfo:newInfo})
    })
    //接收别人的消息
    socket.on('CONTENT',(msg)=>{
      let list = this.state.chatList;
      list.push({user:msg.user,txt:msg.txt})
      this.setState({chatList:list})
    })
    //监听服务器的连接
    socket.on('disconnect',()=>{
      this.setState({fclose:true})
    })
  }
  //发送消息
  send(){
    if(this.state.myclose){  //如果用户退出，将发不出消息
      return false
    }else{
      let value = this.refs['textbox'].value;
      this.refs['textbox'].value ='';
      socket.emit('message',{type:'content',content:value})
      let list = this.state.chatList;
      list.push({user:this.state.userName,txt:value})
      this.setState({chatList:list})
    }
  
  }
  //关闭聊天窗口
  closeWindow(){
    if(window.confirm("确认要退出吗？")){
        socket.disconnect();
        this.setState({myclose:true})
    }
  }
  render() {
    let {chatList,userName,addInfo,myclose,friendList,fclose} = this.state
    return (
      <div className="App">
        <div className='container'>
            <div className='head'>进来的都是真爱，发个消息给好友吧</div>
            <div id="friends-box">
              <p>群成员 <span>{friendList.length}</span></p>
              <ul id="friend-list">
                {
                  friendList.map((name,index)=>{
                        return <li><em></em><span className={name===userName?"my":''}>{name}</span></li>
                  })
                }
              </ul>
            </div>
            <div id="record-box" ref='record'>
              {
                addInfo.map((v,index)=>{
                  return <div className='addInfo' key={index}>{v.time}   {v.txt}</div>
                })
              }
              {
                chatList.map((v,index)=>{
                  if(v.user==userName){
                      return <div className='right-div' key={index} ref='chatitem'>
                                <em className='photo right-photo'></em><span className='name right-name'>{v.user}</span><span className='say right-say'>{v.txt}</span>
                           </div>
                  }else{
                      return <div className='left-div' key={index} ref='chatitem'>
                                <em className='photo left-photo'></em><span className='name left-name'>{v.user}</span><span className='say left-say'>{v.txt}</span>
                           </div>
                  }
                })
              }
              {myclose?<div className='addInfo'>你已退出群聊，收不到好友的消息啦</div>:""}
              {fclose?<div className='addInfo'>服务器断开啦</div>:""}
            </div>
            <div id="send-box">
             <textarea rows="8" cols="80" ref='textbox'></textarea>
                <div className="btn">
                  <button type="button" name="close" onClick={this.closeWindow.bind(this)}>关闭</button>
                  <button type="button" name="send" onClick={this.send.bind(this)}>发送</button>
                </div>
              </div>
            
          </div>
      </div>
    );
  }
}
export default App;
