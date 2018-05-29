import React from "react";
import { Grid } from "material-ui";
import { RegularCard, ItemGrid } from "components";

import MinersTable from './MinersTable';

class Miners extends React.Component {
    constructor() {
        super();
        if (this.supportsSSE()) {
          this.eventListener = new EventSource('/sse');
        }
      }
    
    state = {
        knownminers: '',
    };

    supportsSSE() {
        return !!window.EventSource;
      }
    
    componentDidMount() {
        this.callApiGetMiners()
        .then(res => this.setState({ knownminers: res.knownminers }))
        .catch(err => console.log(err));
        this.subscribe(this.eventListener);
    }

    componentWillUnMount() {
        if (this.eventListener) this.eventListener.close();
    }
    
    callApiGetMiners = async () => {
        const response = await fetch('/api/knownminers');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };
    
    subscribe(es) {
        const that = this;
        if (!es) return;
    
        es.addEventListener('full-cycle-miner', (e) => {
          var d = new Date();
          let txt = d.toLocaleString() + ": EventSource: " + e.data;
          console.log(txt);
          that.addMiner(e.data);
        }, false);
   
      }
    
      addMiner(miner_message) {
        const msg_json = JSON.parse(miner_message);
        const minerstats = JSON.parse(msg_json.body)[0];
        //todo: should use key property
        this.setState({ [minerstats.miner.name]: minerstats });
        this.addAlert(msg_json.timestamp + ':' + minerstats.miner.name);
      }
    
    render() {
		const jminers = JSON.parse(JSON.stringify(this.state.knownminers));
        return (
            <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Miners"
                cardSubtitle="All Miners"
                content={
                    <MinersTable miners={jminers} />
                }
                />
            </ItemGrid>
            </Grid>
        );
    }    
}

export default Miners;
