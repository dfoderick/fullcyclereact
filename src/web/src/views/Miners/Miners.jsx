import React from "react";
import { Grid } from "material-ui";
import { RegularCard, ItemGrid } from "components";

import MinersTable from './MinersTable';

class Miners extends React.Component {
    constructor() {
        super();
        this.state = { knownminers: [] };
        if (this.supportsSSE()) {
          this.eventListener = new EventSource('/sse');
        }
      }
    
    state = {
        knownminers: [],
    };

    supportsSSE() {
        return !!window.EventSource;
      }
    
    componentDidMount() {
        this.callApiGetMiners()
        .then(res => {
            const arrMiners = [];
            if (res.knownminers != null){
                Object.keys(res.knownminers).forEach(function(key) {
                  arrMiners.push(JSON.parse(res.knownminers[key], function (key, value) {
                        return (value == null) ? "" : value
                    }));
                });
            };
            this.setState({ knownminers: arrMiners });
        })
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
        return JSON.parse(JSON.stringify(body));
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
    
      addMiner = (miner_message) => {
        const msg_json = JSON.parse(miner_message);
        const minerstats = JSON.parse(msg_json.body)[0];
        //todo: should use key property
        this.updateMiner(this.getMinerKey(minerstats.miner), minerstats.miner);
      }

      getMinerKey(miner) {
        if (!!miner.minerid) return miner.minerid;
        if (!!miner.networkid) return miner.networkid;
        return miner.name;
      }
    
      updateMiner = (key, miner) => {
        // let updatedMiner = {...this.state.knownminers, [key]: miner};
        // this.setState({updatedMiner});

        // if (this.state.knownminers.hasOwnProperty(miner.key))
        // {
        //     this.setState({
        //         knownminers: [ miner.key, ...this.state.knownminers ]
        //       });
        //     }
        // }
        var index = this.state.knownminers.findIndex(x=> x.name === miner.name);
        if (index === -1)
        {
            this.setState({
                knownminers: [ miner, ...this.state.knownminers ]
              });
            }
        else {
            this.setState({
                knownminers: [
                ...this.state.knownminers.slice(0,index),
                Object.assign({}, this.state.knownminers[index], miner),
                ...this.state.knownminers.slice(index+1)
                ]
            });
        }
      }

    render() {
		const jminers = this.state.knownminers;
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
