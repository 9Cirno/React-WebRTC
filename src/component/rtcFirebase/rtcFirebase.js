import React from 'react'
import {withRouter} from 'react-router-dom'

@withRouter
class RtcFirebase extends React.Component{

  constructor(props){
    super(props)  

  }

 componentDidMount(){
  

}
	render(){
		return(
			<div className='video-area'>
				<video className="_localVideo" id="localVideo" autoPlay muted playsinline></video>
        <video className="_remoteVideo" id="remoteVideo" autoPlay playsinline></video>
        <button onclick="showFriendsFace()" type="button" class="btn btn-primary btn-lg">Call</button>
			</div>
		)
	}
}

export default RtcFirebase