import React, { Component } from 'react'
//import MoneyButton from 'react-money-button'
import MoneyButton from '@moneybutton/react-money-button'

class DonateButton extends Component {
    render() {
        let amt = process.env.REACT_APP_DONATE_AMOUNT;
        return (
            <MoneyButton
            to="145"
            amount={amt}
            currency="USD"
            label="Donate"
            />
        )
    }
}

export default DonateButton;