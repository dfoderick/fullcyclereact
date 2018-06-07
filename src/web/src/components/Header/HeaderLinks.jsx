import React from "react";
import classNames from "classnames";
import { Manager, Target, Popper } from "react-popper";
import {
  withStyles,
  IconButton,
  MenuItem,
  MenuList,
  Grow,
  Paper,
  ClickAwayListener,
  Hidden
} from "material-ui";
import { Person, Notifications, Dashboard
  //, Search 
} from "@material-ui/icons";

//import { CustomInput, IconButton as SearchButton } from "components";

import headerLinksStyle from "assets/jss/material-dashboard-react/headerLinksStyle";

class HeaderLinks extends React.Component {
  state = {
    open: false
  };
  handleClick = () => {
    this.setState({ open: !this.state.open });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleLogout = () => {
    this.props.history.push('/login');
  };

  handleDashboard = () => {
    this.props.history.push('/dashboard');
  };

  renderAlert(alert) {
    const { classes } = this.props;
    return (
      <MenuItem key = {alert}
        onClick={this.handleClose}
        className={classes.dropdownItem}
        style={{"whiteSpace": "pre-line"}}
      >
        {alert && alert.slice(0,150)}
      </MenuItem>
      );
  }

  render() {
    const { classes } = this.props;
    const { open } = this.state;
    const renderedAlerts = this.props.alerts && this.props.alerts.map((a) => this.renderAlert(a));

    return (
      <div>
        <IconButton
          color="inherit"
          aria-label="Dashboard"
          className={classes.buttonLink}
          onClick={this.handleDashboard}
        >
          <Dashboard className={classes.links} />
          <Hidden mdUp>
            <p className={classes.linkText}>Dashboard</p>
          </Hidden>
        </IconButton>
        <Manager style={{ display: "inline-block" }}>
          <Target>
            <IconButton
              color="inherit"
              aria-label="Notifications"
              aria-owns={open ? "menu-list" : null}
              aria-haspopup="true"
              onClick={this.handleClick}
              className={classes.buttonLink}
            >
              <Notifications
              className={classes.links} />
              <span className={classes.notifications}>
                {renderedAlerts ? renderedAlerts.length : 0}
              </span>
              <Hidden mdUp>
                <p onClick={this.handleClick} className={classes.linkText}>
                  Notification
                </p>
              </Hidden>
            </IconButton>
          </Target>
          <Popper
            placement="bottom-start"
            eventsEnabled={open}
            className={
              classNames({ [classes.popperClose]: !open }) +
              " " +
              classes.pooperResponsive
            }
          >
            <ClickAwayListener onClickAway={this.handleClose}>
              <Grow
                in={open}
                id="menu-list"
                style={{ transformOrigin: "0 0 0" }}
              >
                <Paper className={classes.dropdown}>
                <Hidden mdUp>
                <MenuList role="menu">
                    {renderedAlerts}
                  </MenuList>
              </Hidden>
                </Paper>
              </Grow>
            </ClickAwayListener>
          </Popper>
        </Manager>
        <IconButton
          color="inherit"
          aria-label="Person"
          className={classes.buttonLink}
          onClick={this.handleLogout}
          >
          <Person className={classes.links} />
          <Hidden mdUp>
          <MenuList role="menu">
              <MenuItem
            onClick={this.handleLogout}
            className={classes.dropdownItem}
          >
            Log out
          </MenuItem>
          </MenuList>
          </Hidden>
        </IconButton>
      </div>
    );
  }
}

export default withStyles(headerLinksStyle)(HeaderLinks);
