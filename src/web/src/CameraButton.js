import React, { Component } from 'react';
import Button from 'material-ui/Button';
import Chip from 'material-ui/Chip';
import Avatar from 'material-ui/Avatar';
import Dialog, {DialogContent, DialogActions} from 'material-ui/Dialog';

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

        return (
        <span >
            <Chip
            style={{ margin : '5px'}}
			avatar={
					<Avatar src={"data:image/jpeg;base64," + sensorCamera.value}>
					</Avatar>
			}
			label="Camera"
            onClick={() => {this.handleOpenDialog()}}
            />
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
