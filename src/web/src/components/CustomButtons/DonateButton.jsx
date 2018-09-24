import React, { Component } from 'react'
//import MoneyButton from 'react-money-button'
import MoneyButton from '@moneybutton/react-money-button'

class DonateButton extends Component {
    render() {
      return (
        <MoneyButton
        to="145"
        amount="10"
        currency="USD"
        label="Donate"
        />
      )
    }
}

export default DonateButton;