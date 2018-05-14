import React from "react";
//import { Grid } from "material-ui";

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
        const { classes } = this.props;
		const jminers = JSON.parse(JSON.stringify(this.state.knownminers));
        return (
            <MinersTable miners={jminers} />
        );
    }    
}

export default Miners;
