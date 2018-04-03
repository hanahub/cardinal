import React from 'react';
import {Navbar} from 'react-bootstrap';
import NavItemGroup from './navItemGroup.jsx';

export default class NavBar extends React.Component {

    constructor(props) {
        super(props);

    }

    render() {

        return (
            <Navbar collapseOnSelect fixedTop fluid>
                <Navbar.Header>
                    <Navbar.Brand>
                        {this.props.navBarBrand}
                    </Navbar.Brand>
                    <Navbar.Toggle />
                </Navbar.Header>
                <Navbar.Collapse>
                    <NavItemGroup iconNavItems={this.props.leftItems} />
                    <NavItemGroup pullRight={true} iconNavItems={this.props.rightItems} historyCopy={this.props.historyCopy} />
                </Navbar.Collapse>
            </Navbar>
        );
    };

}
