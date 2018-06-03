import React from "react";
import { Grid } from "material-ui";

import {
  ItemGrid,
  Button
} from "components";

class MiningCommands extends React.Component {

    discover() {
        this.callApiCommand('discover')
        .then(res => this.setState({ }))
        .catch(err => console.log(err));
    }
    provision() {
        this.callApiCommand('poolconfigurationchanged')
        .then(res => this.setState({ }))
        .catch(err => console.log(err));
    }
    monitor() {
        this.callApiCommand('monitor')
        .then(res => this.setState({ }))
        .catch(err => console.log(err));
    }
    
    callApiCommand = async (commandname) => {
        const response = await fetch('/api/sendcommand', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            command: commandname
            }),
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    render() {
      return (
            <Grid container justify="flex-start">
            <ItemGrid xs={12} sm={12} md={10} lg={8}>

                <Grid container>
                <ItemGrid xs={12} sm={12} md={4}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={() => this.discover()}
                  >
                    Discover
                  </Button>
                </ItemGrid>
                <ItemGrid xs={12} sm={12} md={4}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={() => this.provision()}
                  >
                    Provision
                  </Button>
                </ItemGrid>
                <ItemGrid xs={12} sm={12} md={4}>
                  <Button
                    fullWidth
                    color="primary"
                    onClick={() => this.monitor()}
                  >
                    Monitor
                  </Button>
                </ItemGrid>
              </Grid>
              <br />
              <br />

            </ItemGrid>
        </Grid>
        );
    }
}

export default MiningCommands;
