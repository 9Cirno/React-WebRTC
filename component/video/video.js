import React from 'react'

class Video extends React.Component{

	render(){
		return(
			<div>
				<video id="localVideo" autoplay muted></video>
          		<video id="oppositeVideo" autoplay></video>
			</div>
		)
	}
}

export default Video