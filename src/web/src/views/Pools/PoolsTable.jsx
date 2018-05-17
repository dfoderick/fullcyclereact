import React, { Component } from 'react';
import Table, { TableBody, TableCell, TableHead, TableRow, TableFooter } from 'material-ui/Table';
//import Button from 'material-ui/Button';
//import Dialog, {DialogTitle, DialogContent, DialogActions} from 'material-ui/Dialog';
//import Radio, { RadioGroup } from 'material-ui/Radio';
//import { FormControl, FormControlLabel } from 'material-ui/Form';

const tableColumnStyle = {
    paddingRight: '5px',
    paddingLeft: '5px'
}

export default class PoolsTable extends Component {

    state = {
        pools: '',
    };

    renderPool(p) {
        const pool = p[0]
        return (
        <TableRow key={pool.url}>
             <TableCell style={tableColumnStyle}>
              {pool.pool_type}
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
    
    render() {
        const jpools = this.props.pools;
        const arrPools = [];
        if (jpools != null){
          Object.keys(jpools).forEach(function(key) {
            arrPools.push(JSON.parse(jpools[key], function (key, value) {
              return (value == null) ? "" : value
            }));
          });
        }
        var renderedPools = arrPools.map((p) => this.renderPool(p));
        console.log(arrPools.length.toString() + " pools")

        return (
            <div>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
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
    
            </div>    
        );
    }
}
