import React, { Component } from "react";
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter } from "material-ui/Table";
import Button from "material-ui/Button";
import Dialog, {DialogTitle, DialogContent, DialogActions} from "material-ui/Dialog";
import Radio, { RadioGroup } from "material-ui/Radio";
import { FormControl, FormControlLabel } from "material-ui/Form";
import TextField from "material-ui/TextField";
//import DatePicker from "material-ui/DatePicker";
//<DatePicker hintText="Landscape Dialog" mode="landscape" />

const tableColumnStyle = {
    paddingRight: "5px",
    paddingLeft: "5px"
};

export default class MinersTable extends Component {

    state = {
        activeRowId: "",
		selectedPool: "",
		radReset: "",
        openMiner: false,
        isaddMiner: false,
        minerDetails: true,
        minerip: "1.2.3.4",
        minerid: "",
        minername: "name",
        minerport: "port",
        miner_in_service_date: null,
        miner_location: "",
        minerRaw: false,
        openSwitch: false,
        openReset: false,
    };

    handleAddMiner() {
        //console.log("adding...");
        this.setState({isaddMiner: true});
        var miner = {name:"NewMiner", ipaddress: "192.168.1.1", minerid: "", port: "4028"};
        this.openMiner(miner);
    }

    handleOpenMiner = (miner) => () => { 
        this.setState({isaddMiner: false});
        this.openMiner(miner);
    };

    openMiner(miner) {
        this.setState({activeRowId: miner.name});
        this.setState({openMiner: true});
        this.setState({minerDetails: true});
        this.setState({minerRaw: false});
        this.setState({minerip: miner.ipaddress});
        this.setState({minername: miner.name});
        this.setState({minerport: miner.port});
        this.setState({minerid: miner.minerid});
        this.setState({miner_location: miner.location});
        this.setState({miner_in_service_date: miner.in_service_date});
    };
    
    handleCloseMiner = () => {
        this.setState({openMiner: false});
    };

    handleMinerRaw = () => {
        this.setState({
            minerRaw: true,
            minerDetails: false,
            openReset: false,
            openSwitch: false
        });
    };

    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
    };

    handleChange_date = name => event => {
        this.setState({
          [name]: Date.parse(event.target.value),
        });
    };

    handleMinerDetails = () => {
        this.setState({
            minerDetails: true,
            minerRaw: false,
            openReset: false,
            openSwitch: false
        });
    };

    handleMinerReset = (rowId) => {
        this.setStateOpenReset(rowId);
    };

    setStateOpenReset(rowId) {
        this.setState({
            activeRowId: rowId,
            minerRaw: true,
            minerDetails: false,
            openReset: true,
            openMiner: false,
            openSwitch: false
        });
    }

    handleOpenReset = (rowId) => () => {
        this.setStateOpenReset(rowId);
    };
    
    handleCloseReset = () => {
        this.setState({
            openReset: false
        });
    };
    
    handleDoReset = (miner, pparameter) => {
        if (miner === null) { return; }
        this.handleCloseReset();
        this.callApiReset(miner, pparameter)
            .then(res => this.setState({ }))
            .catch(err => console.log(err));
    };
    
    callApiReset = async (pminer, pparameter) => {
        const response = await fetch("/api/minerrestart", {
            method: "POST",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            miner: pminer,
            command: "restart",
            parameter: pparameter
            }),
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    setStateOpenSwitch(rowId) {
        this.setState({
            activeRowId: rowId,
            minerRaw: true,
            minerDetails: false,
            openSwitch: true,
            openMiner: false,
            openReset: false
        });
    };

    handleMinerSwitch = (rowId) => {
        this.setStateOpenSwitch(rowId);
    };

    handleOpenSwitch = (rowId) => () => {
        this.setStateOpenSwitch(rowId);
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
        const response = await fetch("/api/minerswitchpool", {
            method: "POST",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify({
            miner: pminer,
            command: "switch",
            parameter: ppool
            }),
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };
    
    secondsToString(sseconds) {
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
            return pool.Status === "Alive" && pool.Priority === 0;
        });
    }
          
    renderPool(pool) {
        return (
          <FormControlLabel key={pool.POOL.toString()}
          value={pool.POOL.toString()}
          control={<Radio/>}
          label={pool.Priority+". "+pool.URL + " ("+pool.User+")"} />
        );
    }
  
    handleSwitchChange = event => {
      this.setState({ selectedPool: event.target.value });
    };
  
    handleResetChange = event => {
      this.setState({ radReset: event.target.value });
    };

    handleSaveMiner = (pminer) => {
        const m = pminer;
        if (m){
            m.name = this.state.minername;
            m.ipaddress = this.state.minerip;
            m.port = this.state.minerport;
            m.location = this.state.miner_location;
            m.in_service_date = Date.parse(this.state.miner_in_service_date);
        }
            
        this.callApiSaveMiner(m)
            .then(res => this.setState({ }))
            .catch(err => console.log(err));
        //todo: if there is an error should not close dialog
        this.handleCloseMiner();
    };

    callApiSaveMiner = async (miner) => {
        let bod = {
            command: "save",
            parameter: "",
            id: miner.minerid,
            entity: "miner",
            values: [
                {name: miner.name},
                {ipaddress: miner.ipaddress},
                {port: miner.port},
                {location: miner.location},
                {in_service_date: miner.in_service_date}
            ]
        };

        const response = await fetch("/api/save", {
            method: "POST",
            headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            },
            body: JSON.stringify(bod)
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
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
        return stratum.replace("stratum+tcp://","")
    }

    temperaturefrom(stats){
        return stats.controllertemp + " " + Math.max(stats.tempboard1,stats.tempboard2,stats.tempboard3)
    }

    fansfrom(stats){
        let fans = [];
        if (stats.fan1) { fans.push(stats.fan1); }
        if (stats.fan2) { fans.push(stats.fan2); }
        return fans.length + ":" + fans.join(",") + "rpm"
    }

    hashfrom(stats){
        return stats.currenthash + "@" + stats.frequency
    }

    // <TableCell style={tableColumnStyle}>
    // <Button label="Switch" onClick={this.handleOpenSwitch(miner.name)}>Switch</Button>
    // </TableCell>
    // <TableCell style={tableColumnStyle}>
    //     <Button label="Reset" onClick={this.handleOpenReset(miner.name)} >Reset</Button>
    // </TableCell>

    renderMiner(miner) {
        var localDate = new Date(miner.lastmonitor);
        return (
        <TableRow key={miner.name}>
             <TableCell style={tableColumnStyle}>
             {String(miner.in_service_date)}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.location}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             <Button label="Details" onClick={this.handleOpenMiner(miner)}>{miner.name}</Button>
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.minerinfo.miner_type}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === "online" ? this.hashfrom(miner.minerstats) : miner.status}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === "online" ? this.temperaturefrom(miner.minerstats) : miner.status}&deg;
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === "online" ? this.secondsToString(miner.minerstats.elapsed) : miner.status}
             </TableCell>
             <TableCell style={tableColumnStyle}>
                {isNaN(localDate) ? "?" : localDate.toLocaleString()}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.minerpool.poolname === "?" ? this.clean(miner.minerpool.currentpool) : miner.minerpool.poolname}
             </TableCell>
             <TableCell style={tableColumnStyle}>
             {miner.status === "online" ? this.fansfrom(miner.minerstats) : miner.status}
             </TableCell>
        </TableRow>
        );
      }
      
    render() {
        let arrMiners = this.props.miners;
        let renderedPools = [];
        let renderedMiners = [];
        let selectedMiner = null;
        let selectedpool = null;
        //renderedMiners are a list of miners rendered as table rows
        if (arrMiners) {
            renderedMiners = arrMiners.map((m) => this.renderMiner(m));
            //console.log(arrMiners.length.toString() + " miners")
            //console.log(renderedMiners.length.toString() + " miners rendered")
            // find the data for this active row `id`
            selectedMiner = this.find(arrMiners, this.state.activeRowId );
            if (selectedMiner && selectedMiner.minerpool && selectedMiner.minerpool.allpools){
                selectedpool = this.findcurrentpool(selectedMiner.minerpool.allpools.POOLS);
                //can't do this otherwise it messes up the radio button and won't select
                if (selectedpool) {
                    //console.log(this.state.selectedPool)
                    // if (selectedpool.POOL) {
                    //     console.log(selectedpool.POOL)
                    // }
                    //this.state.selectedPool = selectedpool.POOL.toString();
                }
                renderedPools = this.renderPools(selectedMiner);
            }
         }
         
         if (this.state.isaddMiner)
         {
            selectedMiner = {name:"NewMiner", ipaddress: "192.168.1.1", minerid: "", port: "4028"};
         }

        return (
            <div>
                <div>
                    <Button onClick={() => this.handleAddMiner()}>
                      Add +
                    </Button>
                    {/* <Button>
                      Import
                    </Button> */}
                </div>
            <Table>
            <TableHead>
              <TableRow>
                <TableCell>Install</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell numeric>Hash Rate</TableCell>
                <TableCell numeric>Temperature</TableCell>
                <TableCell>Uptime</TableCell>
                <TableCell>Last Monitored</TableCell>
                <TableCell>Pool</TableCell>
                <TableCell>Fans</TableCell>
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
                <DialogTitle >{selectedMiner.name}({selectedMiner.minerid}) Details</DialogTitle>
                { this.state.minerDetails ? (
                  <FormControl component="fieldset" >
                    <Button onClick={() => {this.handleSaveMiner(selectedMiner)}} color="primary" autoFocus>
                        Save
                    </Button>
                        <TextField
                        id="miner-name"
                        label="Miner Name"
                        value={this.state.minername}
                        onChange={this.handleChange("minername")}
                        margin="normal"
                        />
                        <TextField
                        id="miner-ip"
                        label="IP Address"
                        value={this.state.minerip}
                        onChange={this.handleChange("minerip")}
                        margin="normal"
                        />
                        <TextField
                        id="miner-port"
                        label="Port"
                        value={this.state.minerport}
                        onChange={this.handleChange("minerport")}
                        margin="normal"
                        />
                        <TextField
                        id="miner-inservicedate"
                        label="Install Date"
                        value={this.state.miner_in_service_date}
                        onChange={this.handleChange("miner_in_service_date")}
                        margin="normal"
                        />
                        <TextField
                        id="miner-location"
                        label="Location"
                        value={this.state.miner_location}
                        onChange={this.handleChange("miner_location")}
                        margin="normal"
                        />
                    </FormControl>
                ) : null}
                { this.state.minerRaw ? (
                    <span>
                    <pre>
                    {JSON.stringify(selectedMiner, null, 2)}
                    </pre>
                    </span>
                ) : null}
                </DialogContent>
                    <DialogActions>
                    <Button onClick={() => {this.handleMinerDetails();}} color="primary">
                        Edit
                    </Button>
                    <Button onClick={() => {this.handleMinerRaw();}} color="primary">
                        Raw
                    </Button>
                    <Button onClick={() => {this.handleMinerSwitch(selectedMiner.name);}} color="primary">
                        Switch
                    </Button>
                    <Button onClick={() => {this.handleMinerReset(selectedMiner.name);}} color="primary">
                        Reset
                    </Button>
                    <Button onClick={() => {this.handleCloseMiner();}} color="primary" autoFocus>
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
                    <Button onClick={() => {this.handleCloseSwitch();}} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={() => {this.handleDoSwitch(selectedMiner, this.state.selectedPool);}} color="primary" autoFocus>
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
                        <FormControlLabel key="reset"
                        value="reset"
                        control={<Radio/>}
                        label="Restart using miner api (requires privileged access)" />
                        <FormControlLabel key="reboot"
                        value="reboot"
                        control={<Radio/>}
                        label="Reboot using ssh (requires ssh access)" />
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
