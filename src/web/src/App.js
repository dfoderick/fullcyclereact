import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';
import Dialog, {DialogTitle, DialogContent, DialogContentText, DialogActions} from 'material-ui/Dialog';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
//import FontIcon from 'material-ui/FontIcon';
//import FaceIcon from '@material-ui/icons/Face';
import CameraButton from './CameraButton';
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
    camera: '',
		activeRowId: '',
		openMiner: false,
	  openSwitch: false,
	  openReset: false,
		selectedPool: '',
		radReset: ''
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

  handleOpenMiner = (rowId) => () => {
    this.setState({
      activeRowId: rowId
    });
    this.setState({
      openMiner: true
    });
  };

  handleCloseMiner = () => {
    this.setState({
      openMiner: false
    });
  };


  handleOpenReset = (rowId) => () => {
    this.setState({
      activeRowId: rowId
    });
    this.setState({
      openReset: true
    });
  };

  handleCloseReset = () => {
    this.setState({
      openReset: false
    });
  };

  handleDoReset = (miner, pparameter) => {
	if (miner === null) return;
    this.handleCloseReset();
	this.callApiReset(miner, pparameter)
      .then(res => this.setState({ }))
      .catch(err => console.log(err));
  };

  callApiReset = async (pminer, pparameter) => {
	const response = await fetch('/api/minerrestart', {
	  method: 'POST',
	  headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
		miner: pminer,
		command: 'restart',
		parameter: pparameter
	  }),
	});
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  handleOpenSwitch = (rowId) => () => {
    this.setState({
      activeRowId: rowId
    });
    this.setState({
      openSwitch: true
    });
  };

  handleCloseSwitch = () => {
    this.setState({
      openSwitch: false
    });
  };

  handleDoSwitch = (miner, pool) => {
	  if (miner === null) return;
	  this.handleCloseSwitch();
	  this.callApiSwitch(miner, pool)
      .then(res => this.setState({ }))
      .catch(err => console.log(err));
  };

 callApiSwitch = async (pminer, ppool) => {
	const response = await fetch('/api/minerswitchpool', {
	  method: 'POST',
	  headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
		miner: pminer,
		command: 'switch',
		parameter: ppool
	  }),
	});
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  secondsToString(sseconds){
	var seconds = parseInt(sseconds);
	var numdays = Math.floor(seconds / 86400);
	var numhours = Math.floor((seconds % 86400) / 3600);
	var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
	var numseconds = ((seconds % 86400) % 3600) % 60;
	return numdays + ":" + numhours + ":" + numminutes + ":" + numseconds;
  }

  renderMiner(miner) {
	var localDate = new Date(miner.lastmonitor);
    return (
	<TableRow key={miner.name}>
         <TableCell>
		 <Button label='Details' onClick={this.handleOpenMiner(miner.name)}>{miner.name}</Button>
         </TableCell>
		 <TableCell>
		 {miner.minerinfo.miner_type}
		 </TableCell>
         <TableCell>
		 {miner.status === 'online' ? miner.minerstats.currenthash : miner.status}
         </TableCell>
         <TableCell>
		 {miner.status === 'online' ? miner.minerstats.controllertemp : miner.status}
         </TableCell>
         <TableCell>
		 {miner.status === 'online' ? this.secondsToString(miner.minerstats.elapsed) : miner.status}
         </TableCell>
         <TableCell>
            {isNaN(localDate) ? "?" : localDate.toLocaleString()}
         </TableCell>
         <TableCell>
		 {miner.minerpool.poolname}
         </TableCell>
         <TableCell>
			<Button label='Switch' onClick={this.handleOpenSwitch(miner.name)}>Switch</Button>
         </TableCell>
         <TableCell>
			<Button label='Reset' onClick={this.handleOpenReset(miner.name)} >Reset</Button>
         </TableCell>
	</TableRow>
    );
  }

   find(array, minerid) {
	  return array.find((element) => {
		return element.name === minerid;
	  })
  }

  findcurrentpool(pools) {
	  if (!pools) return;
	  return pools.find((pool) => {
		  //todo; it should really be lowest priority, not priority 0
		  //also could get selected pool from miner.minerpool?
		return pool.Status === 'Alive' && pool.Priority === 0;
	  });
  }

  renderPool(pool) {
	  return (
		<FormControlLabel key={pool.POOL.toString()}
		value={pool.POOL.toString()}
		control={<Radio/>}
		label={pool.Priority+'. '+pool.URL + ' ('+pool.User+')'} />
	  );
  }

  handleSwitchChange = event => {
    this.setState({ selectedPool: event.target.value });
  };

  handleResetChange = event => {
    this.setState({ radReset: event.target.value });
  };

  renderPools(miner) {
	var pools = miner.minerpool.allpools.POOLS.map((p) => this.renderPool(p));
    return (
	  <RadioGroup name="minerpools" value={this.state.selectedPool} onChange={this.handleSwitchChange}>
		{pools}
	  </RadioGroup>
    );
  }

	renderSensor(sensor) {
		const sens = sensor[0];
		console.log(sens.value)
		return (
			<Chip
			avatar={
					<Avatar>
						{sens.valuetype === 'humidity' ? 'H' : 'T'}
					</Avatar>
				}
			 label={parseFloat(sens.value).toFixed(2).toString()} />
		);
	}



  render() {
		const jsensors = JSON.parse(JSON.stringify(this.state.sensors));
		const arrSensors = [];
		if (jsensors){
			Object.keys(jsensors).forEach(function(key) {
			  arrSensors.push(JSON.parse(jsensors[key], function (key, value) {
					return (value == null) ? "" : value
				}));
			});
		}
		const renderedSensors = arrSensors.map((s) => this.renderSensor(s));

    const jcamera = JSON.parse(JSON.stringify(this.state.camera));

		const j = JSON.parse(JSON.stringify(this.state.response));
    const arrMiners = [];
		if (j != null){
			Object.keys(j).forEach(function(key) {
			  arrMiners.push(JSON.parse(j[key], function (key, value) {
					return (value == null) ? "" : value
				}));
			});
		}
		var renderedPools = [];
		//renderedMiners are a list of miners rendered as table rows
		var renderedMiners = arrMiners.map((m) => this.renderMiner(m));
		// find the data for this active row `id`
    const selectedMiner = this.find(arrMiners, this.state.activeRowId );
	 	if (selectedMiner && selectedMiner.minerpool && selectedMiner.minerpool.allpools){
			var selectedpool = this.findcurrentpool(selectedMiner.minerpool.allpools.POOLS);
			//can't do this otherwise it messes up the radio button and won't select
			if (selectedpool)
				console.log(this.state.selectedPool)
				console.log(selectedpool.POOL)
				//this.state.selectedPool = selectedpool.POOL.toString();
			renderedPools = this.renderPools(selectedMiner);
	 	}
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Full Cycle Mining Controller</h1>
        </header>
				<div className="App-intro">
				<div style={styles.wrapper}>
				{renderedSensors}
        <CameraButton sensor={jcamera}></CameraButton>
				</div>
		<Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell numeric>Hash Rate</TableCell>
            <TableCell numeric>Temperature</TableCell>
            <TableCell>Uptime</TableCell>
            <TableCell>Last Monitored</TableCell>
            <TableCell>Pool</TableCell>
            <TableCell></TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
		<TableBody>
			{renderedMiners}
		</TableBody>
		</Table>

		{selectedMiner && this.state.openMiner ? (
			<Dialog
			  modal="false"
			  open={this.state.openMiner}
			>
			<DialogContent>
			<DialogTitle >{selectedMiner.name} Details</DialogTitle>
			<DialogContentText>
			<pre>
			{JSON.stringify(selectedMiner, null, 2)}
			</pre>
			</DialogContentText>
			</DialogContent>
              <DialogActions>
                <Button onClick={() => {this.handleCloseMiner()}} color="primary" autoFocus>
                  Close
                </Button>
              </DialogActions>
			</Dialog>
		): null}

		{selectedMiner && this.state.openSwitch ? (
			<Dialog
			  modal="false"
			  open={this.state.openSwitch}
			>
			<DialogContent>
			<DialogTitle >{this.state.selectedPool}:Switch Pool on {selectedMiner.name}</DialogTitle>
				<FormControl component="fieldset" >
				{renderedPools}
				</FormControl>
			</DialogContent>
              <DialogActions>
                <Button onClick={() => {this.handleCloseSwitch()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={() => {this.handleDoSwitch(selectedMiner, this.state.selectedPool)}} color="primary" autoFocus>
                  Continue switch
                </Button>
              </DialogActions>
			</Dialog>
		): null}

		{selectedMiner && this.state.openReset ? (
			<Dialog
			  modal="false"
			  open={this.state.openReset}
			>
			<DialogContent>
			<DialogTitle >This will make {selectedMiner.name} go offline for a short period!</DialogTitle>
			<DialogContentText>
				<FormControl component="fieldset" >
				<RadioGroup name="commandrestart" value={this.state.radReset} onChange={this.handleResetChange}>
					<FormControlLabel key='reset'
					value='reset'
					control={<Radio/>}
					label='Restart using miner api (requires privileged access)' />
					<FormControlLabel key='reboot'
					value='reboot'
					control={<Radio/>}
					label='Reboot using ssh (requires ssh access)' />
				</RadioGroup>
				</FormControl>
			</DialogContentText>
			</DialogContent>
              <DialogActions>
                <Button onClick={() => {this.handleCloseReset()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={() => {this.handleDoReset(selectedMiner , this.state.radReset)}} color="primary" autoFocus>
                  Continue reset
                </Button>
              </DialogActions>
			</Dialog>

		  ) : null}
        </div>
      </div>
    );
  }
}

export default App;
