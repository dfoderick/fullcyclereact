// This file is shared across the demos.

import React from 'react';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import DraftsIcon from '@material-ui/icons/Drafts';
import StarIcon from '@material-ui/icons/Star';
import InfoIcon from '@material-ui/icons/Info';
import ComputerIcon from '@material-ui/icons/Computer';
import WifiIcon from '@material-ui/icons/Wifi';
import MailIcon from '@material-ui/icons/Mail';
import DeleteIcon from '@material-ui/icons/Delete';
import ReportIcon from '@material-ui/icons/Report';
import About from './About.js';

export const fullcycleListItems = (
  <div>
    <ListItem button
      onClick={() => {this.handleOpenMiners()}}
    >
    <ListItemIcon>
    <ComputerIcon />
    </ListItemIcon>
    <ListItemText primary="Miners" />
    </ListItem>

    <ListItem button
      onClick={() => {this.handleOpenSensors()}}
      >
    <ListItemIcon>
    <WifiIcon />
    </ListItemIcon>
    <ListItemText primary="Sensors" />
    </ListItem>
    <About/>
  </div>
);
