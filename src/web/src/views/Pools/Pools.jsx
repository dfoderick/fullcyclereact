import React from "react";
import { Grid } from "material-ui";
import { RegularCard, ItemGrid } from "components";

import PoolsTable from "./PoolsTable";

class Pools extends React.Component {
    state = {
        knownpools: "",
    };

    componentDidMount() {
        this.callApiGetPools()
        .then(res => this.setState({ knownpools: res.knownpools }))
        .catch(err => console.log(err));
    }

    callApiGetPools = async () => {
        const response = await fetch("/api/knownpools");
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
      };

      render() {
        const jpools = JSON.parse(JSON.stringify(this.state.knownpools));
        const arrPools = [];
        if (jpools != null){
            Object.keys(jpools).forEach(function(key) {
              arrPools.push(JSON.parse(jpools[key], function (key, value) {
                return (value == null) ? "" : value;
              }));
            });
          }
  
        const poolsNamed = arrPools.filter(pool => pool.named_pool);
        const poolsAvailable = arrPools.filter(pool => !pool.named_pool);

        return (
            <Grid container>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Named Pools"
                cardSubtitle="All Pools configured with friendly names"
                content={
                    <PoolsTable pools={poolsNamed} />
                }
                />
            </ItemGrid>
            <ItemGrid xs={12} sm={12} md={12}>
              <RegularCard
                cardTitle="Pools"
                cardSubtitle="All Pools available on Miners"
                content={
                    <PoolsTable pools={poolsAvailable} />
                }
                />
            </ItemGrid>
            </Grid>
        );
    }    
}

export default Pools;
