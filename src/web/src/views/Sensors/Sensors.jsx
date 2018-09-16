import React from "react";
//import { Grid } from "material-ui";

import SensorList from "./SensorList";

class Sensors extends React.Component {
  constructor() {
    super();
    this.state = { sensors: [] };
  }

  state = {
        sensors: [],
        camera: null,
      }

      supportsSSE() {
        return !!window.EventSource;
      }

  componentDidMount() {
		this.callApiGetSensors()
      .then(res => {
        const arrSensors = [];
        if (res.knownsensors != null){
            Object.keys(res.knownsensors).forEach(function(key) {
              arrSensors.push(JSON.parse(res.knownsensors[key], function (key, value) {
                    return (value == null) ? "" : value;
                }));
            });
        };
        this.setState({ sensors: arrSensors });
      })
      .catch(err => console.log(err));

    this.callApiGetCamera()
        .then(res => this.setState({ camera: res.camera }))
        .catch(err => console.log(err));

    if (this.supportsSSE() && !this.eventListener) {
      this.eventListener = new EventSource("/sse");
      this.subscribe(this.eventListener);
    }
  }

  componentWillUnmount() {
    if (this.eventListener){
      this.eventListener.close();
      //console.log("Sensors: unsubscribed");
    }
  }

  callApiGetSensors = async () => {
    const response = await fetch("/api/knownsensors");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  callApiGetCamera = async () => {
    const response = await fetch("/api/getcamera");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    return body;
  };

  subscribe(es) {
    const that = this;
    if (!es) return;

    es.addEventListener("full-cycle-sensor", (e) => {
      //var d = new Date();
      //let txt = d.toLocaleString() + ": EventSource: " + e.data;
      //console.log(txt);
      that.addSensor(e.data);
    }, false);

    //console.log("Sensors: subscribed");

  }

  addSensor = (sensorMessage) => {
    const msgJson = JSON.parse(sensorMessage);
    const sensorvalue = JSON.parse(msgJson.body)[0];
    this.updateSensor(sensorvalue);
  }

  updateSensor = (sensorvalue) => {
    var index = this.state.sensors.findIndex(x=> x.sensorid === sensorvalue.sensorid);
    if (index === -1)
    {
        this.setState({
            sensors: [ sensorvalue, ...this.state.sensors ]
          });
        }
    else {
        this.setState({
            sensors: [
            ...this.state.sensors.slice(0,index),
            Object.assign({}, this.state.sensors[index], sensorvalue),
            ...this.state.sensors.slice(index+1)
            ]
        });
    }
  }

  render() {
    const jsensors = this.state.sensors;
    let jcamera = null;
    try {
      jcamera = JSON.parse(JSON.stringify(this.state.camera));
    }
    catch (error) {
      jcamera = null;
    };
    return (
        <div>
          <SensorList sensor = {jsensors} camera={jcamera} mode={this.props.mode}/>
        </div>
    );
  }    
}

export default Sensors;
