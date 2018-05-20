import React from "react";
import { Grid } from "material-ui";
import { AddAlert } from "@material-ui/icons";
import EventSource from "../../eventsource.js";

import {
  RegularCard,
  A,
  P,
  Small,
  Button,
  SnackbarContent,
  Snackbar,
  ItemGrid
} from "components";

class Notifications extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tl: false,
      tc: false,
      tr: false,
      bl: false,
      bc: false,
      br: false
    };
  }
  
  showNotification(place) {
    var x = [];
    x[place] = true;
    this.setState(x);
    setTimeout(
      function() {
        x[place] = false;
        this.setState(x);
      }.bind(this),
      6000
    );
  }

  componentDidMount() {
    this.subscribe(new EventSource('/sse'), document.getElementById('es-messages'));
  }

  subscribe(es, ul) {
    if (!ul) {
      console.log('could not subscribe. element es-messages could not be found')
      return;
    }
    es.addEventListener('full-cycle-alert', function (e) {
      var li = document.createElement("LI");
      li.appendChild(document.createTextNode(e.data));
      ul.appendChild(li);
    });
  }
  
  render() {
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
            <div class='col'>
              <ul id='es-messages'>
              </ul>
            </div>
          </div>
        }
      />
    );
  }
}

export default Notifications;
