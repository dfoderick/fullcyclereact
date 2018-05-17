import React from "react";
import { Grid } from "material-ui";
import { RegularCard, Table, ItemGrid } from "components";

import PoolsTable from './PoolsTable';

class Pools extends React.Component {
    state = {
        knownpools: '',
    };

    componentDidMount() {
        this.callApiGetPools()
        .then(res => this.setState({ knownpools: res.knownpools }))
        .catch(err => console.log(err));
    }

    callApiGetPools = async () => {
        const response = await fetch('/api/knownpools');
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
      };

      render() {
		const jpools = JSON.parse(JSON.stringify(this.state.knownpools));
        return (
            <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Pools"
                cardSubtitle="All Pools available on Miners"
                content={
                    <PoolsTable pools={jpools} />
                }
                />
            </ItemGrid>
            </Grid>
        );
    }    
}

export default Pools;
