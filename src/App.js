import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Video from './component/video/video'


class App extends Component {
  constructor(props){
    super(props)
  }
  render() {
    return (
      <div>
        <div>header</div>
        <Video></Video>
      </div>
    );
  }
}

export default App;
