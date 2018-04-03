import React from 'react';
import FontAwesome from 'react-fontawesome';
import {NavItem, Nav, NavDropdown, MenuItem} from 'react-bootstrap';
import axios from 'axios';
import { IndexLinkContainer } from 'react-router-bootstrap';


export default class NavItemGroup extends React.Component {

    constructor () {
        super();
        this.logout = this.logout.bind(this);
        this.scrollTo = this.scrollTo.bind(this);
    }

    logout() {
        axios.post('/api/logout')
            .then(() => {
                this.props.historyCopy.replace({pathname: '/'});
            })
            .catch(err => {console.log(err)});
    }

    setEventKey() {
        for (let i = 0; i < this.props.iconNavItems.length; i++) {
            this.props.iconNavItems[i].eventKey = i+1
        }
    }

    scrollTo(id) {
        document.getElementById(id).scrollIntoView();
    }


    getNavItem(item, handler) {
        if (item.type === 'hash') {
            return (
                <NavItem eventKey={item.eventKey} href='' onClick={this.scrollTo(item.url)}>
                    <FontAwesome name={item.iconName} tag="span" className="margin-right-7px"/>{item.itemName}
                </NavItem>
            )
        }

        if (item.type === 'functional') {
            return (
                <NavItem eventKey={item.eventKey} href='' onClick={handler}>
                    <FontAwesome name={item.iconName} tag="span" className="margin-right-7px"/>{item.itemName}
                </NavItem>
            )
        }

        if (item.type === 'dropdown') {
            return (
                <NavDropdown eventKey={item.eventKey} title={
                    <span>
                        <FontAwesome name={item.iconName} tag="span" className="margin-right-7px"/>{item.itemName}
                    </span>
                } id="report-dropdown">
                    {
                        item.menuItems.map(tag =>
                            <IndexLinkContainer key={tag.eventKey} to={tag.url}>
                                <MenuItem eventKey={tag.eventKey}>{tag.linkName}</MenuItem>
                            </IndexLinkContainer>
                        )
                    }
                </NavDropdown>
            )
        }

        return (
            <IndexLinkContainer to={item.url}>
                <NavItem eventKey={item.eventKey}>
                    <FontAwesome name={item.iconName} tag="span" className="margin-right-7px"/>{item.itemName}
                </NavItem>
            </IndexLinkContainer>
        );
    }

    render () {

        const IconNavItem = (props) => (
            this.getNavItem(props.item, this.logout)
        );

        // this.setEventKey();
        const navItems = this.props.iconNavItems.map(item =>
            <IconNavItem key={item.eventKey} item={item} />
        );
        let output = this.props.pullRight ? <Nav pullRight>{navItems}</Nav> : <Nav>{navItems}</Nav>;
        return output

    }
}