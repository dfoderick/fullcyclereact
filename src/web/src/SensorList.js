import React, { Component } from 'react';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';

export default class CameraButton extends Component {

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
        </span>

        );
    }
}
