import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import { withStyles } from 'material-ui/styles';
import Table, { TableBody, TableCell, TableHead, TableRow } from 'material-ui/Table';
import Button from 'material-ui/Button';
import Dialog, {DialogTitle, DialogContent, DialogContentText, DialogActions} from 'material-ui/Dialog';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControl, FormControlLabel } from 'material-ui/Form';
import logo from './logo.svg';
import './App.css';

class App extends Component {
	  state = {
		response: '',
		activeRowId: '',
		openMiner: false,
	    openSwitch: false,
	    openReset: false,
		selectedPool: ''
  };

  componentDidMount() {
    this.callApi()
      .then(res => this.setState({ response: res.knownminers }))
      .catch(err => console.log(err));
  }

  callApi = async () => {
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
  
  handleDoReset = (miner) => {
	if (miner === null) return;
    this.handleCloseReset();
	this.callApiReset(miner)
      .then(res => this.setState({ }))
      .catch(err => console.log(err));
  };
  
  callApiReset = async (pminer) => {
	const response = await fetch('/api/minerrestart', {
	  method: 'POST',
	  headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	  },
	  body: JSON.stringify({
		miner: pminer,
		command: 'restart',
		parameter: null
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
            {localDate.toLocaleString()}
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
  return pools.find((pool) => {
	  //todo; it should really be lowest priority, not priority 0
	  //also could get selected pool from miner.minerpool?
    return pool.Status === 'Alive' && pool.Priority === 0;
  })
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
  renderPools(miner) {
	var pools = miner.minerpool.allpools.POOLS.map((p) => this.renderPool(p));
    return (
	  <RadioGroup name="minerpools" value={this.state.selectedPool} onChange={this.handleSwitchChange}>
		{pools}
	  </RadioGroup>
    );
  }

  render() {
	const j = JSON.parse(JSON.stringify(this.state.response))

    var arrMiners = [];
	var renderedPools = []
	if (j != null){
		Object.keys(j).forEach(function(key) {
		  arrMiners.push(JSON.parse(j[key], function (key, value) {
				return (value == null) ? "" : value
			}));
		});
	}
	//renderedMiners are a list of miners rendered as table rows
	var renderedMiners = arrMiners.map((m) => this.renderMiner(m));
	// find the data for this active row `id`
    const selectedMiner = this.find(arrMiners, this.state.activeRowId );
	 if (selectedMiner)
	 {
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
			{JSON.stringify(selectedMiner)}
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
			Do you really want to reset {selectedMiner.name}?
			</DialogContentText>
			</DialogContent>
              <DialogActions>
                <Button onClick={() => {this.handleCloseReset()}} color="primary">
                  Cancel
                </Button>
                <Button onClick={() => {this.handleDoReset(selectedMiner)}} color="primary" autoFocus>
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
