import React from 'react';
import {Glyphicon, Form, FormGroup, FormControl, ControlLabel, Button, ButtonToolbar, Row, Col, Alert} from 'react-bootstrap';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Link} from 'react-router-dom';
import axios from 'axios';


const rightItems = [
    {eventKey: 1, url: "/register", iconName: "address-card", itemName: "Register", toHash: false},
    {eventKey: 2, url: "/login", iconName: "sign-in", itemName: "Login", toHash: false}];

class LoginPanel extends React.Component {

    constructor() {
        super();
        this.state = {
            showLoader: false,
            validation: null,
            showAlert: false,
            message: ''
        };
        this.loginWithCrediential = this.loginWithCrediential.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
    }


    loginWithCrediential(e) {

        e.preventDefault();
        let form = document.forms.loginForm;

        axios.post('/api/login', {
            username: form.login_username.value,
            password: form.login_password.value
        })
            .then((res) => {

                let status = res.data.status;
                if (status) {
                    this.setState({validation: "success"});
                    this.props.history.push('/profile');

                } else {
                    this.setState({validation: "error", showAlert: true, message: res.data.message});
                }

            })
            .catch(err => {console.log(err)});

    }

    closeAlert() {
        this.setState({showAlert: false});
    }


    render() {

        return (
            <PageLoader show={this.state.showLoader}>
                <NavBar navBarBrand={navBarBrand} leftItems={[]} rightItems={rightItems} />
                    <div className="panel-grid">
                        {this.state.showAlert ?
                            <Alert bsStyle="danger" onDismiss={this.closeAlert}>
                                <p>{this.state.message}</p>
                            </Alert> : null
                        }
                        <Row>
                            <Col md={3}>
                            </Col>

                            <Col md={6}>
                                    <h1>
                                        <Link to='/'>
                                            <Glyphicon glyph="chevron-left" className="chevron-cardinal-gray" />
                                        </Link>
                                        Login
                                    </h1>
                                <hr />
                                <Form name="loginForm" onSubmit={this.loginWithCrediential}>
                                    <FormGroup validationState={this.state.validation}>
                                        <ControlLabel>Username</ControlLabel>
                                        <FormControl name="login_username" autoFocus placeholder="username"/>
                                    </FormGroup>
                                    <FormGroup validationState={this.state.validation}>
                                        <ControlLabel>Password</ControlLabel>
                                        <FormControl type="password" name="login_password" placeholder="password"/>
                                    </FormGroup>
                                    <FormGroup>
                                        <ButtonToolbar>
                                            <Button type="submit"
                                                    block
                                                    className="btn-cardinal-orange btn-panel btn-panel-single">
                                                Login
                                            </Button>
                                        </ButtonToolbar>
                                    </FormGroup>
                                </Form>
                            </Col>

                            <Col md={3}>
                            </Col>

                        </Row>
                    </div>
            </PageLoader>


        );
    };

}


export default LoginPanel;
