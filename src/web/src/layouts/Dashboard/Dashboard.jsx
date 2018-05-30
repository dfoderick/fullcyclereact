import React from "react";
//try native implementation instead of this helper lib
//import EventSource from "../../eventsource.js";
import PropTypes from "prop-types";
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { withStyles } from "material-ui";

import { Header, Footer, Sidebar } from "components";

import dashboardRoutes from "routes/dashboard.jsx";

import appStyle from "assets/jss/material-dashboard-react/appStyle.jsx";

import image from "assets/img/sidebar-2.jpg";
import logo from "assets/img/reactlogo.png";

class App extends React.Component {
  constructor() {
    super();
    if (this.supportsSSE()) {
      this.state = {alerts:[]};
    } else {
      this.state = {alerts:["Browser does not support EventSource :("]};
    }
  }

  state = {
    mobileOpen: false,
    alerts: [],
    sensors: {},
    miners: {}
  };

  supportsSSE() {
    return !!window.EventSource;
  }
  
  handleDrawerToggle = () => {
    this.setState({ mobileOpen: !this.state.mobileOpen });
  };
  
  ismaps() {
    return this.props.location.pathname === "/maps";
  }

  isnotifications() {
    return this.props.location.pathname === "/notifications";
  }

  componentDidMount() {
    if(navigator.platform.indexOf('Win') > -1){
      // eslint-disable-next-line
      const ps = new PerfectScrollbar(this.refs.mainPanel);
    }
    if (this.supportsSSE() && !this.eventListener) {
      this.eventListener = new EventSource('/sse');
      this.subscribe(this.eventListener);
    }
  }

  componentDidUpdate() {
    this.refs.mainPanel.scrollTop = 0;
  }
  
  componentWillUnmount() {
    if (this.eventListener) this.eventListener.close();
  }

  addAlert(alert) {
    //limits alerts to 100 messages.
    //todo: make configurable
    console.log(alert);
    this.setState({
      alerts: [alert, ...this.state.alerts.slice(0, 99)]
    });
  }

  subscribe(es) {
    const that = this;
    if (!es) return;
    es.addEventListener('full-cycle-alert', (e) => {
      var d = new Date();
      let txt = d.toLocaleString() + ": EventSource: " + e.data;
      that.addAlert(txt);
    }, false);

    // es.addEventListener('full-cycle-sensor', (e) => {
    //   var d = new Date();
    //   let txt = d.toLocaleString() + ": EventSource: " + e.data;
    //   console.log(txt);
    //   that.addSensor(e.data);
    // }, false);

    // es.addEventListener('full-cycle-miner', (e) => {
    //   var d = new Date();
    //   let txt = d.toLocaleString() + ": EventSource: " + e.data;
    //   console.log(txt);
    //   that.addMiner(e.data);
    // }, false);

    es.addEventListener('open', (e) => {
      var d = new Date();
      let txt = d.toLocaleString() + ": EventSource opened";
      console.log(txt);
    }, false);

    es.addEventListener('error', (e) => {
      var d = new Date();
      let txt = d.toLocaleString() + ": ";
      switch (e.readyState) {
          case EventSource.CONNECTING:
              txt += 'EventSource reconnecting...';
              break;
          case EventSource.CLOSED:
              txt += 'EventSource failed. Will not retry.';
              break;
          default:
          txt += 'EventSource failed. unknown readyState ' + e.readyState;
      }
      console.log(txt);

    }, false);

  }

  // addSensor(sensor_message) {
  //   const msg_json = JSON.parse(sensor_message);
  //   const sensorvalue = JSON.parse(msg_json.body)[0];
  //   this.setState({ [sensorvalue.sensorid]: sensorvalue });
  //   this.addAlert(msg_json.timestamp + ':' + sensorvalue.sensorid);
  // }

  // addMiner(miner_message) {
  //   const msg_json = JSON.parse(miner_message);
  //   const minerstats = JSON.parse(msg_json.body)[0];
  //   //todo: should use key property
  //   this.setState({ [minerstats.miner.name]: minerstats });
  //   this.addAlert(msg_json.timestamp + ':' + minerstats.miner.name);
  // }

  switchRoutes= () => {
    const that = this;
    return (
    <Switch>
      {dashboardRoutes.map((prop, key) => {
        if (prop.redirect)
          return <Redirect from={prop.path} to={prop.to} key={key} />;

        var RoutedComponent = prop.component;
        return <Route path={prop.path} key={key} 
          render={(props) => <RoutedComponent {...props} alerts={ that.state.alerts} />}
         />;
      })}
    </Switch>
  )};
  
  render() {
    const { classes, ...rest } = this.props;
    const routeswitches = this.switchRoutes();
    return (
      <div className={classes.wrapper}>
        <Sidebar
          routes={dashboardRoutes}
          logoText={"Full Cycle"}
          logo={logo}
          image={image}
          handleDrawerToggle={this.handleDrawerToggle}
          open={this.state.mobileOpen}
          color="blue"
          {...rest}
        />
        <div className={classes.mainPanel} ref="mainPanel">
          <Header
            routes={dashboardRoutes}
            alerts={this.state.alerts}
            handleDrawerToggle={this.handleDrawerToggle}
            {...rest}
          />
          {/* custom layouts */}
          {!this.ismaps() ? (
            <div className={classes.content}>
              <div className={classes.container}>{routeswitches}</div>
            </div>
          ) : (
            <div className={classes.map}>{routeswitches}</div>
          )}
          {!this.ismaps() ? <Footer /> : null}
        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(appStyle)(App);
