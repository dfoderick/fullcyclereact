import React, { Component } from 'react';
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter } from 'material-ui/Table';
import Button from 'material-ui/Button';
import Dialog, {DialogTitle, DialogContent, DialogActions} from 'material-ui/Dialog';
import Radio, { RadioGroup } from 'material-ui/Radio';
import { FormControl, FormControlLabel } from 'material-ui/Form';

const tableColumnStyle = {
    paddingRight: '5px',
    paddingLeft: '5px'
}

export default class MinersTable extends Component {

    state = {
        knownminers: '',
        activeRowId: '',
		selectedPool: '',
		radReset: '',
        openMiner: false,
        openSwitch: false,
        openReset: false,
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
        if (!sseconds) return "no stats";
        var seconds = parseInt(sseconds, 10);
        var numdays = Math.floor(seconds / 86400);
        var numhours = Math.floor((seconds % 86400) / 3600);
        var numminutes = Math.floor(((seconds % 86400) % 3600) / 60);
        var numseconds = ((seconds % 86400) % 3600) % 60;
        return numdays + ":" + numhours + ":" + numminutes + ":" + numseconds;
    }
            
    find(array, minerid) {
        return array.find((element) => {
            return element.name === minerid;
        });
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

    clean(stratum){
        return stratum.replace('stratum+tcp://','')
    }
  
    renderMiner(miner) {
        var localDate = new Date(miner.lastmonitor);
        return (
        <TableRow key={miner.name}>
             <TableCell style={tableColumnStyle}>
             <Button label='Details' onClick={this.handleOpenMiner(miner.name)}>{miner.name}</Button>
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.minerinfo.miner_type}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === 'online' ? miner.minerstats.currenthash : miner.status}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === 'online' ? miner.minerstats.controllertemp : miner.status}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === 'online' ? this.secondsToString(miner.minerstats.elapsed) : miner.status}
             </TableCell>
             <TableCell style={tableColumnStyle}>
                {isNaN(localDate) ? "?" : localDate.toLocaleString()}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.minerpool.poolname === '?' ? this.clean(miner.minerpool.currentpool) : miner.minerpool.poolname}
             </TableCell>
             <TableCell style={tableColumnStyle}>
                <Button label='Switch' onClick={this.handleOpenSwitch(miner.name)}>Switch</Button>
             </TableCell>
             <TableCell style={tableColumnStyle}>
                <Button label='Reset' onClick={this.handleOpenReset(miner.name)} >Reset</Button>
             </TableCell>
        </TableRow>
        );
      }
    
    render() {
        const jminers = this.props.miners;
        const arrMiners = [];
		if (jminers != null){
			Object.keys(jminers).forEach(function(key) {
			  arrMiners.push(JSON.parse(jminers[key], function (key, value) {
					return (value == null) ? "" : value
				}));
			});
		}
		var renderedPools = [];
		//renderedMiners are a list of miners rendered as table rows
        var renderedMiners = arrMiners.map((m) => this.renderMiner(m));
        console.log(arrMiners.length.toString() + " miners")
        console.log(renderedMiners.length.toString() + " miners rendered")
		// find the data for this active row `id`
        const selectedMiner = this.find(arrMiners, this.state.activeRowId );
	 	if (selectedMiner && selectedMiner.minerpool && selectedMiner.minerpool.allpools){
			var selectedpool = this.findcurrentpool(selectedMiner.minerpool.allpools.POOLS);
			//can't do this otherwise it messes up the radio button and won't select
			if (selectedpool)
                console.log(this.state.selectedPool)
                // if (selectedpool.POOL) {
                //     console.log(selectedpool.POOL)
                // }
				//this.state.selectedPool = selectedpool.POOL.toString();
			renderedPools = this.renderPools(selectedMiner);
	 	}

        return (
            <div>
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
            <TableFooter>
            <TableRow>
            </TableRow>
            </TableFooter>
            </Table>
    
            {selectedMiner && this.state.openMiner ? (
                <Dialog
                  modal="false"
                  open={this.state.openMiner}
                >
                <DialogContent>
                <DialogTitle >{selectedMiner.name} Details</DialogTitle>
                <span>
                    <pre>
                    {JSON.stringify(selectedMiner, null, 2)}
                    </pre>
                </span>
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
                <DialogContent>
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
                </DialogContent>
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
        );
    }
}
