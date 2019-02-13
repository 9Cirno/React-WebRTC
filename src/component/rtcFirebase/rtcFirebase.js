//选择这段代码主要是因为这个组件是在完成自己项目需求之后，对部分代码进行修改让这个组件成为一个React上可以重复使用的WebRTC组件。
//这是我所写的第一个可以真正意义上多项目复用组件。
import React from 'react'
import {withRouter} from 'react-router-dom'

@withRouter
class RtcFirebase extends React.Component{

  constructor(props){
    super(props)
    if (!this.props.location.hash) {
      // here is one of solutions by generate the possible random unique id to etabulish chat
      // you can always replace code here to use your logic, be sure url are shared in both client
      // in order to create the stream connection. 
      this.props.history.push(`#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`) 
    }

     const roomHash = this.props.location.hash.substring(1);
     
  // DATA provided below are in real format, please change according to your Firebase server 
      this.config={
        apiKey: "REPLACED_WITH_YOUR_API_KEY",
        authDomain: "webrtc-server-63859.firebaseapp.com",
        databaseURL: "https://webrtc-server-63859.firebaseio.com",
        projectId: "webrtc-server-63859",
        storageBucket: "webrtc-server-63859.appspot.com",
        messagingSenderId: "500122117041"
      }
      this.servers = {'iceServers': [{'urls': 'stun:stun.services.mozilla.com'}, {'urls': 'stun:stun.l.google.com:19302'}, {'urls': 'turn:numb.viagenie.ca','credential': 'beaver','username': 'webrtc.websitebeaver@gmail.com'}]};
      this.database=undefined
      this.yourVidel=undefined
      this.friendsVideo=undefined
      this.yourId=roomHash
      this.receiverId = this.yourId.split('_')[1]
      this.yourId=this.yourId.split('_')[0]
      this.pc = undefined
      window.firebase.initializeApp(this.config);
      this.showFriendsFace=this.showFriendsFace.bind(this)
      this.readMessage=this.readMessage.bind(this)
      this.showMyFace=this.showMyFace.bind(this)
      this.sendMessage=this.sendMessage.bind(this)
  }
  readMessage(data) {
    var msg = JSON.parse(data.val().message);
    var sender = data.val().sender;
    var receiver = data.val().receiver
    if (sender != this.yourId && receiver==this.yourId) {
        if (msg.ice != undefined)
            this.pc.addIceCandidate(new RTCIceCandidate(msg.ice));
        else if (msg.sdp.type == "offer")
            this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp))
              .then(() => this.pc.createAnswer())
              .then(answer => this.pc.setLocalDescription(answer))
              .then(() => this.sendMessage(this.receiverId,this.yourId, JSON.stringify({'sdp': this.pc.localDescription})));
        else if (msg.sdp.type == "answer")
            this.pc.setRemoteDescription(new RTCSessionDescription(msg.sdp));
    }
};
  showMyFace() {
  //////////////////////////////////////////////////////////////////////////////////////
  // Be Careful!!
  // Detect client device first, if client device miss microphone/camara,
  // still enable following audio:true/ video:true will result error
  // Incase only use in for mobile device, it will be ok
  // Pay attention to disable audio/video accrodingly if your client my be other device 
  //////////////////////////////////////////////////////////////////////////////////////
	  
  navigator.mediaDevices.getUserMedia({audio:true, video:true})
    .then(stream => this.yourVideo.srcObject = stream)
    .catch(()=>{alert('device error')})
    .then(stream => this.pc.addStream(stream))
    .catch(()=>{alert('device error')})
  }
  showFriendsFace() {
  this.pc.createOffer()
    .then(offer => this.pc.setLocalDescription(offer) )
    .then(() => this.sendMessage(this.receiverId, this.yourId, JSON.stringify({'sdp': this.pc.localDescription})) );
  }

  sendMessage(receiverId, senderId, data) {
    var msg = this.database.push({ receiver:receiverId, sender: senderId, message: data });
    msg.remove();
  }
 componentDidMount(){

    this.database = window.firebase.database().ref();
    this.yourVideo = document.getElementById("localVideo");
    this.friendsVideo = document.getElementById("remoteVideo");
    //this.yourId = Math.floor(Math.random()*1000000000);
    this.pc=new RTCPeerConnection(this.servers)
    this.pc.onicecandidate = (event => event.candidate?this.sendMessage(this.receiverId, this.yourId, JSON.stringify({'ice': event.candidate})):console.log("Sent All Ice") );
    this.pc.onaddstream = (event => this.friendsVideo.srcObject = event.stream);
    this.database.on('child_added', this.readMessage);
}
	// here provide the simplest implementation for the front end
	// the Accept Button would start to receive stream from target client
	// the Call button will start stream to the target client
	// implement your local based on the demand
	render(){
		return(
			<div className='video-area'>
				<video className="_localVideo" id="localVideo" autoPlay playsinline muted></video>
        <video className="_remoteVideo" id="remoteVideo" autoPlay playsinline></video>
        <button onClick={this.showFriendsFace} type="button" className="btn btn-primary btn-lg">Accept</button>
        <button onClick={this.showMyFace} type="button" className="btn btn-primary btn-lg">Call</button>
			</div>
		)
	}
}

export default RtcFirebase
