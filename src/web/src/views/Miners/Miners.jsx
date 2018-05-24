import React from "react";
import { Grid } from "material-ui";
import { RegularCard, ItemGrid } from "components";

import MinersTable from './MinersTable';

class Miners extends React.Component {
    state = {
        knownminers: '',
    };

    componentDidMount() {
        this.callApiGetMiners()
        .then(res => this.setState({ knownminers: res.knownminers }))
        .catch(err => console.log(err));
    }

    callApiGetMiners = async () => {
        const response = await fetch('/api/knownminers');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
      };
    
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
