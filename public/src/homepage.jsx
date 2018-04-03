import React from 'react';
import {Button, Jumbotron, ButtonToolbar} from 'react-bootstrap';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import {Link} from 'react-router-dom';

const rightItems = [
    {eventKey: 1, url: "/register", iconName: "address-card", itemName: "Register", toHash: false},
    {eventKey: 2, url: "/login", iconName: "sign-in", itemName: "Login", toHash: false}];


export default class TeamDashBoard extends React.Component {
    constructor () {
        super();

    }


    render () {
        return (
            <div>
                <NavBar navBarBrand={navBarBrand} leftItems={[]} rightItems={rightItems} historyCopy={this.props.history} />

                <Jumbotron className="welcome-jumbotron">
                    <h1>Welco2222me!</h1>
                    <p>This is the <a href="https://www.cardinaladvising.com/">Cardinal Advising</a> Analytics Platform, the only place for sports analytics.</p>
                    <ButtonToolbar className="panel-grid panel-center">
                        <Link to='/login'>
                            <Button bsSize="large" className="btn-cardinal-orange btn-panel">Login</Button>
                        </Link>
                        <Link to='/register'>
                            <Button bsSize="large" className="btn-cardinal-gray btn-panel">Register</Button>
                        </Link>
                    </ButtonToolbar>
                </Jumbotron>
            </div>
        )
    }
}
