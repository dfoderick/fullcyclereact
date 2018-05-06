import React, { Component } from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import IconButton from 'material-ui/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
//import PropTypes from 'prop-types';
//import { withStyles } from 'material-ui/styles';
//import FontIcon from 'material-ui/FontIcon';
//import FaceIcon from '@material-ui/icons/Face';
import MinersTable from './MinersTable';
import SensorList from './SensorList';
//import logo from './logo.svg';
import './App.css';

const appstyles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

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
    margin: 5,
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
        <div className={appstyles.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={appstyles.menuButton} color="inherit" aria-label="Menu">
            <MenuIcon/>
            </IconButton>
            <Typography variant="title" color="inherit" className={appstyles.flex}>
              Full Cycle Mining Controller
            </Typography>
            <div style={styles.wrapper}>
            <SensorList sensor = {jsensors} camera={jcamera}/>
            </div>
          </Toolbar>
        </AppBar>
      </div>
				<div className="App-intro">
          <MinersTable miners={jminers} />
        </div>
      </div>
    );
  }
}

export default App;
