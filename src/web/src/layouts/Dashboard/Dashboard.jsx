import React from "react";
import EventSource from "../../eventsource.js";
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
    this.state = {alerts:[]};
  }

  state = {
    mobileOpen: false,
    alerts: []
  };

  sseEvents = new EventSource('/sse');

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
    this.subscribe(this.sseEvents);
  }

  componentDidUpdate() {
    this.refs.mainPanel.scrollTop = 0;
  }
  
  componentWillUnMount() {
    this.sseEvents.close();
  }

  subscribe(es) {
    const that = this;
    es.addEventListener('full-cycle-alert', (e) => {
      console.log(e.data);
        that.setState({
          alerts: [...that.state.alerts, e.data]
        });
    });
  }

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
