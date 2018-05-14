import React, { Component } from 'react';
//import PropTypes from 'prop-types';
//import { withStyles } from 'material-ui/styles';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';
import Button from 'material-ui/Button';
import CameraButton from './CameraButton';
//import humidity from './icons/humidity.svg';
//import temperature from './icons/temperature.svg';
import { Grid } from "material-ui";
import {
    StatsCard,
//    ChartCard,
//    TasksCard,
//    RegularCard,
//    Table,
    ItemGrid
  } from "components";
  import {
    Store,
//    Warning,
    DateRange
//    LocalOffer,
//    Update,
//    ArrowUpward,
//    AccessTime,
//    Accessibility
  } from "@material-ui/icons";
 
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
          <ItemGrid xs={12} sm={6} md={3}>
          <StatsCard
            icon={Store}
            iconColor='blue'
            title={sens.valuetype}
            description={parseFloat(sens.value).toFixed(2).toString()}
            statIcon={DateRange}
            statText={sens.valuetype}
            onClick={() => {this.handleOpenDialog(sens)}}
          />
        </ItemGrid>

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
            <Grid container>
            {renderedSensors}
            <CameraButton sensor={this.props.camera} mode={this.props.mode}/>

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
        </Grid>

        );
    }
}

