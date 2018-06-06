import React, { Component } from 'react';
import { Grid } from "material-ui";
import TextField from 'material-ui/TextField';
import {
    RegularCard,
    Button,
    //CustomInput,
    ItemGrid
  } from "components";
  
class Login extends Component {
    constructor(props){
        super(props);
        this.state={
            username: '',
            password: '',
            message: '',
            count: 0
        }
    }

    callApiLogin = async (username, password) => {
        let bod = {
            username: username,
            password: password
        }

        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(bod)
        });
        const body = await response.json();
        if (response.status !== 200) throw Error(body.message);
        return body;
    };

    handleClick = () => {
        const { username, password, count } = this.state;

        this.callApiLogin(username, password)
        .then(res => 
            {
                sessionStorage.setItem('jwtToken', res.token);
                this.setState({ message: '' });
                this.setState({ count: 0 });
                this.props.history.push('/')
            }
        )
        .catch(err => {
            let cnt = count + 1;
            this.setState({ count: cnt });
            this.setState({ message: 'Invalid user name or password' });
        });
    }

    handleChange = name => event => {
        this.setState({
          [name]: event.target.value,
        });
    };

render() {
    return (
        <div>
        <Grid container>
        <ItemGrid xs={12} sm={12} md={8}>
            <RegularCard
            cardTitle="Full Cycle Login"
            cardSubtitle={this.state.message}
            content={
                <div>
                <form onSubmit={this.onSubmit}>
                    <Grid container>
                        <ItemGrid xs={12} sm={12} md={5}>
                            <TextField
                                id="username"
                                label="Enter your Username"
                                value={this.state.username}
                                onChange={this.handleChange('username')}
                                margin="normal"
                                />
                        </ItemGrid>
                    </Grid>
                    <Grid container>
                        <ItemGrid xs={12} sm={12} md={3}>
                        <TextField
                                id="password"
                                label="Enter your password"
                                value={this.state.password}
                                onChange={this.handleChange('password')}
                                margin="normal"
                                />
                        </ItemGrid>
                    </Grid>
                </form>
                </div>
            }
            footer={<Button type="submit" color="primary" onClick={this.handleClick}>Login</Button>}
            />
        </ItemGrid>
        </Grid>
        </div>
    );
  }
}

// const style = {
//  margin: 15,
// };
export default Login;