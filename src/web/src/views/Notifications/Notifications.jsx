import React from "react";
//import { Grid } from "material-ui";
//import { AddAlert } from "@material-ui/icons";
import EventSource from "../../eventsource.js";

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
      this.state = {
        alerts: []
      };
  }

  state = {
    alerts: []
  };

  sseEvents = new EventSource('/sse');

  componentDidMount() {
    this.subscribe(this.sseEvents);
  }

  componentWillUnMount() {
    this.sseEvents.close();
  }

  subscribe(es) {
    es.addEventListener('full-cycle-alert', (e) => {
      console.log(e.data);
        this.setState({
          alerts: [...this.state.alerts, e.data]
        });
    });
  }

  renderAlert(alert) {
    return (
      <li key={alert}>
        {alert}
      </li>
    );
  }
  
  render() {
    const renderedAlerts = this.state.alerts.map((a) => this.renderAlert(a));
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
            <ul id='es-messages'>
              {renderedAlerts}
            </ul>
          </div>
        }
      />
    );
  }
}

export default Notifications;
