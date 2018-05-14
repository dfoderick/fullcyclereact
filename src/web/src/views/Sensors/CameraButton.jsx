import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';
import camera from './icons/camera.svg';
import {
    StatsCard,
    ChartCard,
    TasksCard,
    RegularCard,
    Table,
    ItemGrid
  } from "components";
import {
    ContentCopy,
    Store,
    InfoOutline,
    Warning,
    DateRange,
    LocalOffer,
    Update,
    ArrowUpward,
    AccessTime,
    Accessibility
  } from "@material-ui/icons";

const rootStyle = {
  };

const chipStyle = {
  };

  const imageStyle = {
  };


  const styles = theme => ({
    root: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
    },
    chip: {
      margin: theme.spacing.unit,
    },
  });

export default class CameraButton extends Component {

    state = {
        camera: '',
        openCamera: false
        };

    handleOpenDialog = () => { this.setState({ openCamera: true }); };

    handleCloseCamera = () => { this.setState({ openCamera: false }); };

//{"data:image/jpeg;base64," + sensorCamera.value}
    render() {
        const strsensor = this.props.sensor;
        if (!strsensor || strsensor === " " || strsensor === "") return null;
        let jsensor = JSON.parse(strsensor);
        let sensorCamera = jsensor[0];

        if (this.props.mode === 'expanded'){
            return (
                <img
                alt="Camera"
                src={"data:image/jpeg;base64," + sensorCamera.value}
                />
            );
        } else {
        return (
            <span>
            <ItemGrid xs={12} sm={6} md={3}>
          <StatsCard
            icon={Store}
            iconColor="purple"
            title="Camera"
            description="Camera"
            statIcon={DateRange}
            statText='Camera'
            onClick={() => {this.handleOpenDialog()}}
          />
        </ItemGrid>

            {this.state.openCamera && sensorCamera ? (
            <Dialog
                modal="true"
                open={this.state.openCamera}
            >
            <DialogContent>
            <img
                alt="Camera"
                src={"data:image/jpeg;base64," + sensorCamera.value}
            />
            </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {this.handleCloseCamera()}} color="primary" autoFocus>
                        Close
                        </Button>
                    </DialogActions>
            </Dialog>
            ): null}
            </span>
        );
    }
    }
}
