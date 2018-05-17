import React from "react";
import PropTypes from "prop-types";
import { withStyles } from "material-ui";
import MiningCommands from "./MiningCommands.jsx";
import MinerSummary from "./MinerSummary.jsx";
import Sensors from "views/Sensors/Sensors.jsx";
// react plugin for creating charts
//import ChartistGraph from "react-chartist";

import dashboardStyle from "assets/jss/material-dashboard-react/dashboardStyle"

class Dashboard extends React.Component {

  render() {
    return (
      <div>
        <MiningCommands/>
        <MinerSummary/>
        <Sensors/>
      </div>
    );
  }
}

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(dashboardStyle)(Dashboard);
