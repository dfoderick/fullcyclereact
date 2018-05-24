import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';
//import camera from './icons/camera.svg';
import {
    StatsCard,
    ItemGrid
  } from "components";
import {
    Store,
    Info
  } from "@material-ui/icons";


export default class CameraButton extends Component {

    state = {
        camera: '',
        openCamera: false
        };

    handleOpenDialog = () => { this.setState({ openCamera: true }); };

    handleCloseCamera = () => { this.setState({ openCamera: false }); };

    render() {
        const strsensor = this.props.sensor;
        if (!strsensor || strsensor === " " || strsensor === "") return null;
        let jsensor = JSON.parse(strsensor);
        let sensorCamera = jsensor[0];

        if (this.props.mode === 'button') {
            return (
                <span>
                    <ItemGrid xs={12} sm={6} md={3}>
                    <StatsCard
                        icon={Store}
                        iconColor="purple"
                        title="Camera"
                        description="Camera"
                        statIcon={Info}
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
        } else {
            if (this.props.mode === 'small') {
                return (
                    <img
                    alt="Camera" width="200" height="140"
                    src={"data:image/jpeg;base64," + sensorCamera.value}
                    />
                );
            } else {
                return (
                    <img
                    alt="Camera" 
                    src={"data:image/jpeg;base64," + sensorCamera.value}
                    />
                );
            }
        }
    }
}
