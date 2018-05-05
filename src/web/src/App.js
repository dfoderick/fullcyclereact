import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import { withStyles } from 'material-ui/styles';
//import FontIcon from 'material-ui/FontIcon';
//import FaceIcon from '@material-ui/icons/Face';
import MinersTable from './MinersTable';
import SensorList from './SensorList';
import logo from './logo.svg';
import './App.css';

const styles = theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  chip: {
    margin: 3,
  },
  wrapper: {
    margin: 3,
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    width: 60,
    height: 60,
  },
});

class App extends Component {
	  state = {
      response: '',
      sensors: '',
      camera: ''
    };

  componentDidMount() {
		this.callApiGetSensors()
      .then(res => this.setState({ sensors: res.knownsensors }))
      .catch(err => console.log(err));
    this.callApiGetCamera()
        .then(res => this.setState({ camera: res.camera }))
        .catch(err => console.log(err));
    this.callApiGetMiners()
      .then(res => this.setState({ response: res.knownminers }))
      .catch(err => console.log(err));
  }

	callApiGetSensors = async () => {
    const response = await fetch('/api/knownsensors');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  callApiGetCamera = async () => {
    const response = await fetch('/api/getcamera');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  callApiGetMiners = async () => {
    const response = await fetch('/api/knownminers');
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  render() {
		const jsensors = JSON.parse(JSON.stringify(this.state.sensors));
    const jcamera = JSON.parse(JSON.stringify(this.state.camera));
		const jminers = JSON.parse(JSON.stringify(this.state.response));
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Full Cycle Mining Controller</h1>
        </header>
				<div className="App-intro">
          <div style={styles.wrapper}>
          <SensorList sensor = {jsensors} camera={jcamera}/>
          </div>
          <MinersTable miners={jminers} />
        </div>
      </div>
    );
  }
}

export default App;
