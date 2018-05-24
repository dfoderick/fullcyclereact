import React from "react";
//import { Grid } from "material-ui";

import SensorList from './SensorList';

class Sensors extends React.Component {
    state = {
        sensors: '',
        camera: '',
      }

  componentDidMount() {
		this.callApiGetSensors()
      .then(res => this.setState({ sensors: res.knownsensors }))
      .catch(err => console.log(err));
    this.callApiGetCamera()
        .then(res => this.setState({ camera: res.camera }))
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

  render() {
		const jsensors = JSON.parse(JSON.stringify(this.state.sensors));
    const jcamera = JSON.parse(JSON.stringify(this.state.camera));
    return (
        <div>
          <SensorList sensor = {jsensors} camera={jcamera} mode={this.props.mode}/>
        </div>
    );
  }    
}

export default Sensors;
