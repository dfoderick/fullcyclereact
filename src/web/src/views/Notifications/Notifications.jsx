import React from "react";
//import { Grid } from "material-ui";
//import { AddAlert } from "@material-ui/icons";

import {
  RegularCard,
  //A,
  P
  //Small,
  //Button,
  //SnackbarContent,
  //Snackbar,
  //ItemGrid
} from "components";

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {alerts: props.alerts};
  }

  state = {
    alerts: []
  };

  componentWillReceiveProps(nextProps){
    if(nextProps.alerts !== this.props.alerts){
        this.setState({alerts: nextProps.alerts});
    }
  }

  renderAlert(alert) {
    return (
      <li key={alert}>
      style={{"whiteSpace": "pre-line"}}
        {alert}
      </li>
    );
  }
  
  render() {
    const renderedAlerts = this.state.alerts && this.state.alerts.map((a) => this.renderAlert(a));
    if (renderedAlerts) {
      //console.log(renderedAlerts.length);
    } else {
      //console.log("no alerts");
    }
    return (
      <RegularCard
        cardTitle="Notifications"
        cardSubtitle={
          <P>
            Alerts from Full Cycle Mining Controller
          </P>
        }
        content={  
          <div>
            <ul id="es-messages">
              {renderedAlerts}
            </ul>
          </div>
        }
      />
    );
  }
}

export default Notifications;
