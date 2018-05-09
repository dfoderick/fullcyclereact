import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';
import { ListItem, ListItemIcon, ListItemText } from 'material-ui/List';
import StarIcon from '@material-ui/icons/Star';

export default class About extends Component {

    state = {
        openDialog: false
        };

    handleOpenDialog = () => { this.setState({ openDialog: true }); };

    handleCloseDialog = () => { this.setState({ openDialog: false }); };

    render() {

        return (
            <span>
                <ListItem button
                    onClick={() => {this.handleOpenDialog()}}
                >
                <ListItemIcon>
                <StarIcon />
                </ListItemIcon>
                <ListItemText primary="About" />
                </ListItem>

            {this.state.openDialog ? (
            <Dialog
                modal="true"
                open={this.state.openDialog}
            >
            <DialogContent>
                <div>
                    Full Cycle Mining Controller
                </div>
                <div>
                    Source code is at <a target="_blank" href="http://github.com/dfoderick/fullcycle.git">GitHub</a>
                </div>
                <div>
                    Project page <a target="_blank" href="https://dfoderick.github.io/fullcycle/">GitHub</a>
                </div>
                <div>
                    <a target="_blank" href="https://github.com/dfoderick/fullcycle/wiki">Wiki</a>
                </div>
                <div>
                    Author David Foderick dfoderick@gmail.com
                </div>

            </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {this.handleCloseDialog()}} color="primary" autoFocus>
                        Close
                        </Button>
                    </DialogActions>
            </Dialog>
            ): null}
            </span>
        );
    }
}