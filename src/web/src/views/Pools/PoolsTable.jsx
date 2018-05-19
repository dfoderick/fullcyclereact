import React, { Component } from 'react';
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter } from 'material-ui/Table';
//import Button from 'material-ui/Button';
import Dialog, {DialogTitle, DialogContent, DialogActions} from 'material-ui/Dialog';
import { FormControl } from 'material-ui/Form';
import TextField from 'material-ui/TextField';
import {
    Button,
    CustomInput,
    ItemGrid
  } from "components";

const tableColumnStyle = {
    paddingRight: '5px',
    paddingLeft: '5px'
}

export default class PoolsTable extends Component {
    state = {
        pools: [],
        openPool: false,
        activeRowId : '',
        existingPoolName: '',
        poolName: ''
    };

    handleOpenPool = (pool) => () => {
        this.setState({ activeRowId: pool.url+'|'+pool.user });
        this.setState({ openPool: true });
        this.setState({existingPoolName: pool.named_pool.name});
        this.setState({poolName: pool.named_pool.name});
    };

    handleClosePool= () => {
        this.setState({ openPool: false });
    };

    handleNamePool = (ppool, newPoolName) => {
        const pool = ppool
        if (pool){
            if (!pool.named_pool){
                pool.named_pool = {name: newPoolName};
            }
            pool.named_pool.name = newPoolName;
        }
            
        //this.handleSetPoolName(newPoolName);
        this.callApiSavePool(this.state.existingPoolName, pool)
            .then(res => this.setState({ }))
            .catch(err => console.log(err));
        //todo: if there is an error should not close dialog
        this.handleClosePool();
    };

    callApiSavePool = async (existingPoolName, pool) => {
        let bod = {
            command: 'save',
            parameter: '',
            id: '',
            entity: 'pool',
            values: [
                {name: pool.named_pool.name},
                {pool_type: pool.pool_type},
                {url: pool.url},
                {user: pool.user},
                {priority: pool.priority}
            ]
        }
        if (existingPoolName) {
            bod.id = {name: existingPoolName}
        }

        const response = await fetch('/api/save', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(bod)
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    renderPool(p) {
        const pool = p
        return (
        <TableRow key={pool.url+'|'+pool.user}>
             <TableCell style={tableColumnStyle}>
              {pool.pool_type}
             </TableCell>
             <TableCell style={tableColumnStyle}>
                {
                    pool.named_pool ? 
                    (
                         <Button onClick={this.handleOpenPool(pool)} color="primary" autoFocus>
                            { pool.named_pool.name }
                          </Button>  
                    ) :
                    (
                        <Button onClick={this.handleOpenPool(pool)} color="primary" autoFocus>
                        Add Name
                      </Button>  
                    )
                }
             </TableCell>
             <TableCell style={tableColumnStyle}>
              {pool.priority}
             </TableCell>
             <TableCell style={tableColumnStyle}>
              {pool.url}
             </TableCell>
             <TableCell style={tableColumnStyle}>
              {pool.user}
             </TableCell>
             <TableCell style={tableColumnStyle}>
              {pool.password}
             </TableCell>
        </TableRow>
        );
      }
    
    find(array, key) {
        return array.find((element) => {
            return element.url+'|'+element.user === key;
        });
    }

    handleNameChange = event => {
        this.setState({ poolName: event.target.value });
      };

    handleSetPoolName= (value) => {
        this.setState({ poolName: value });
    };

    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
    };

//     <CustomInput
//     labelText="Pool Name"
//     value={this.state.poolName}
//     onChange={this.handleNameChange}
//     id="pool-name"
//     formControlProps={{
//       fullWidth: true
//     }}
//   />

    render() {
        const jpools = this.props.pools;
        const arrPools = jpools;
        const renderedPools = arrPools.map((p) => this.renderPool(p));
        console.log(arrPools.length.toString() + " pools");
        const selectedPool = this.find(arrPools, this.state.activeRowId );
        // if (selectedPool)
        //     this.handleSetPoolName(selectedPool.named_pool.name);
        return (
            <div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell numeric>Priority</TableCell>
                  <TableCell>Url</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Password</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                  {renderedPools}
              </TableBody>
              <TableFooter>
                <TableRow>
                </TableRow>
              </TableFooter>
            </Table>

            {selectedPool && this.state.openPool ? (
                <Dialog
                  modal="false"
                  open={this.state.openPool}
                >
                <DialogContent>
                <DialogTitle >{selectedPool.named_pool ? 'Edit' : 'Add'} Pool Name</DialogTitle>
                <DialogContent>
                    <FormControl component="fieldset" >
                    <TextField
                    id="pool-name"
                    label="Pool Name"
                    value={this.state.poolName}
                    onChange={this.handleChange('poolName')}
                    margin="normal"
                    />
                    </FormControl>
                </DialogContent>
                </DialogContent>
                  <DialogActions>
                    <Button onClick={() => {this.handleClosePool()}} color="primary">
                      Cancel
                    </Button>
                    <Button onClick={() => {this.handleNamePool(selectedPool , this.state.poolName)}} color="primary" autoFocus>
                      Save
                    </Button>
                  </DialogActions>
                </Dialog>
            ): null}

            </div>    
        );
    }
}
