import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';
import Button from 'material-ui/Button';

const styles = theme => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    chip: {
      margin: theme.spacing.unit,
    },
  });
  
export default class SensorList extends Component {
    state = {
        sensors: '',
        selectedSensor: '',
        openDialog: false
    };

    handleOpenDialog = (sensor) => { 
        this.setState({ selectedSensor: JSON.stringify(sensor, null, 2) }); 
        this.setState({ openDialog: true }); 
    };

    handleCloseDialog = () => { this.setState({ openDialog: false }); };
 
    handleClick = (sensor) => { 
        alert(JSON.stringify(sensor)); // eslint-disable-line no-alert
      }

    renderSensor(sensor) {
		const sens = sensor[0];
		console.log(sens.value)
		return (
            <Chip key={sens.sensorid}
            style={{ margin : '5px'}}
			avatar={
					<Avatar>
						{sens.valuetype === 'humidity' ? 'H' : 'T'}
					</Avatar>
			}
			label={parseFloat(sens.value).toFixed(2).toString()}
            onClick={() => {this.handleOpenDialog(sens)}}
            />
            );
	}

    render() {
        const strsensor = this.props.sensor;
        const jsensors = strsensor;
		const arrSensors = [];
		if (jsensors){
			Object.keys(jsensors).forEach(function(key) {
			  arrSensors.push(JSON.parse(jsensors[key], function (key, value) {
					return (value == null) ? "" : value
				}));
			});
        }
		const renderedSensors = arrSensors.map((s) => this.renderSensor(s));

        return (
        <span >
            {renderedSensors}
             {this.state.openDialog && this.state.selectedSensor ? (
                <Dialog
                    modal="true"
                    open={this.state.openDialog}
                >
                <DialogContent>
                <pre>
                {this.state.selectedSensor}
                </pre>
                </DialogContent>
                        <DialogActions>
                            <Button onClick={() => {this.handleCloseDialog()}} color="primary" autoFocus>
                            Close
                            </Button>
                        </DialogActions>
                </Dialog>
                ): null}
        </span>

        );
    }
}

