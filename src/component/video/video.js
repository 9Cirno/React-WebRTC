import React from 'react'
import {withRouter} from 'react-router-dom'

@withRouter
class Video extends React.Component{

  constructor(props){
    super(props)
    // TODO: Replace with your own channel ID
    if (!this.props.location.hash) {
      this.props.history.push(`#${Math.floor(Math.random() * 0xFFFFFF).toString(16)}`) 
    }
    // Generate random room name if needed

  // Room name needs to be prefixed with 'observable-'
     const roomHash = this.props.location.hash.substring(1);

      this.drone=new window.ScaleDrone('yiS12Ts5RdNhebyM')
      this.roomName = 'observable-' + roomHash
      this.configuration = {
        iceServers: [{
          urls: 'stun:stun.l.google.com:19302'
      }]
      }
      
      this.room=undefined
      this.pc=undefined
      this.sendMessage=this.sendMessage.bind(this)
      this.localDescCreated=this.localDescCreated.bind(this)
      this.startWebRTC=this.startWebRTC.bind(this)
      this.ready_to_connect=this.ready_to_connect.bind(this)
    //const drone =  new window.ScaleDrone('yiS12Ts5RdNhebyM');
   
    // const roomName = 'observable-' + roomHash;
    // const configuration = {
    //   iceServers: [{
    //     urls: 'stun:stun.l.google.com:19302'
    //   }]
    // };
    // let room;
   


  }

onSuccess() {};
onError(error) {
  console.error(error);
};

sendMessage(message) {
  this.drone.publish({
    room: this.roomName,
    message
  });
}

localDescCreated(desc) {
  this.pc.setLocalDescription(
    desc,
    () => this.sendMessage({'sdp': this.pc.localDescription}),
    this.onError
  );
}

startWebRTC(isOfferer) {
  this.pc = new RTCPeerConnection(this.configuration);

  // 'onicecandidate' notifies us whenever an ICE agent needs to deliver a
  // message to the other peer through the signaling server
  this.pc.onicecandidate = event => {
    if (event.candidate) {
      this.sendMessage({'candidate': event.candidate});
    }
  };

  // If user is offerer let the 'negotiationneeded' event create the offer
  if (isOfferer) {
    this.pc.onnegotiationneeded = () => {
      this.pc.createOffer().then(this.localDescCreated).catch(this.onError);
    }
  }

  // When a remote stream arrives display it in the #remoteVideo element
  this.pc.ontrack = event => {
    const stream = event.streams[0];
    if (!document.getElementById('remoteVideo').srcObject || document.getElementById('remoteVideo').srcObject.id !== stream.id) {
      document.getElementById('remoteVideo').srcObject = stream;
    }
  };

  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  }).then(stream => {
    // Display your local video in #localVideo element
    document.getElementById('localVideo').srcObject = stream;
    // Add your stream to be sent to the conneting peer
    stream.getTracks().forEach(track => this.pc.addTrack(track, stream));
  }, this.onError);


  // Listen to signaling data from Scaledrone
  this.room.on('data', (message, client) => {
    // Message was sent by us
    if (client.id === this.drone.clientId) {
      return;
    }

    if (message.sdp) {
      // This is called after receiving an offer or answer from another peer
      this.pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
        // When receiving an offer lets answer it
        if (this.pc.remoteDescription.type === 'offer') {
          this.pc.createAnswer().then(this.localDescCreated).catch(this.onError);
        }
      }, this.onError);
    } else if (message.candidate) {
      // Add the new ICE candidate to our connections remote description
      this.pc.addIceCandidate(
        new RTCIceCandidate(message.candidate), this.onSuccess, this.onError
      );
    }
  });
}

ready_to_connect(){
      console.log(this)
    this.drone.on('open', error => {
      if (error) {
        return console.error(error);
      }
      this.room= this.drone.subscribe(this.roomName)
      this.room.on('open', error => {
        if (error) {
          this.onError(error);
        }
      });
      // We're connected to the room and received an array of 'members'
      // connected to the room (including us). Signaling server is ready.
      this.room.on('members', members => {
        console.log('MEMBERS', members);
        // If we are the second user to connect to the room we will be creating the offer
        const isOfferer = members.length === 2;
        this.startWebRTC(isOfferer);
      })
    })
}


 componentDidMount(){
  this.ready_to_connect()
// Send signaling data via Scaledrone
}
	render(){
		return(
			<div className='video-area'>
				<video className="_localVideo" id="localVideo" autoPlay muted></video>
        <video className="_remoteVideo" id="remoteVideo" autoPlay></video>
			</div>
		)
	}
}

export default Video