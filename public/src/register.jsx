import React from 'react';
import {
    Glyphicon,
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Button,
    ButtonToolbar,
    Row,
    Col,
    HelpBlock,
    Modal,
    Alert,
    OverlayTrigger,
    Popover,
    Table} from 'react-bootstrap';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import {Link} from 'react-router-dom';
import {Util} from './util.jsx';
import axios from 'axios';

const rightItems = [
    {eventKey: 1, url: "/register", iconName: "address-card", itemName: "Register", toHash: false},
    {eventKey: 2, url: "/login", iconName: "sign-in", itemName: "Login", toHash: false}];

export default class RegisterPanel extends React.Component {

    constructor() {
        super();
        this.state = {
            usernameValidation: null,
            passwordValidation: null,
            emailValidation: null,
            invitationValidation: null,
            showModal: false,
            alertStyle: "info",
            showAlert: false,
            message: ''};
        this.register = this.register.bind(this);
        this.closeModal = this.closeModal.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.validateUsername = this.validateUsername.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.validateInvCode = this.validateInvCode.bind(this);

    }

    checkInvCode(e) {
        let i = 0, len = e.length, code = 0;

        if (len <= 0) return false;

        for (i = 0; i < len; i++) {
            code = e.charCodeAt(i);
            if (!(code > 47 && code < 58) && // numeric (0-9)
                !(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123) && (e[i] !== '-')) { // lower alpha (a-z)
                return false;
            }
        }

        return true;
    }

    validateInvCode(e) {
        let inv = e.target.value;

        let res = this.checkInvCode(inv) && inv.split('-').length === 5;
        if (res) {
            this.setState({invitationValidation: 'success'});
        } else {
            this.setState({invitationValidation: 'error'});
        }
    }

    checkSpecialChar(char) {
        const speChars = [
            ' ', '!', '"', '#', '$',
            '%', '&', "'", '(', ')',
            '*', '+', ',', '-', '.',
            '/', ':', ';', '<', '=',
            '>', '?', '@', '[', '\\',
            ']', '^', '_', '`', '{',
            '|', '}', '~'];

        return speChars.includes(char);
    }

    validatePassword(e) {
        let pw = e.target.value;

        let res = Util.checkAlphanumeric(pw) && pw.length >= 6;
        if (res) {
            this.setState({passwordValidation: 'success'});
        } else {
            this.setState({passwordValidation: 'error'});
        }
    }

    checkEmail(e) {
        let t = e.split('@');
        return (t.length === 2 && t[1]);
    }


    validateEmail(e) {
        let email = e.target.value;

        let res = this.checkEmail(email);
        if (res) {
            this.setState({emailValidation: 'success'});
        } else {
            this.setState({emailValidation: 'error'});
        }
    }

    validateUsername(e) {
        let username = e.target.value;

        let res = Util.checkAlphanumeric(username);
        if (res) {
            this.setState({usernameValidation: 'success'});
        } else {
            this.setState({usernameValidation: 'error'});
        }
    }

    closeModal() {
        this.setState({showModal: false});
    }

    closeAlert() {
        this.setState({showAlert: false});
    }

    register (e) {
        e.preventDefault();

        if (this.state.usernameValidation !== 'success' ||
            this.state.emailValidation !== 'success' ||
            this.state.passwordValidation !== 'success' ||
            this.state.invitationValidation !== 'success') {
            this.setState({alertStyle: "danger", showAlert: true, message: "Please check the validations first. "});
            return;
        }

        let form = document.forms.registerForm;

        axios.post('/api/user/' + form.invitation.value, {
            data: {
                username: form.register_username.value,
                new_password: form.register_password.value,
                email: form.email.value,
            }})
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({showModal: true, message: res.data.message});

                } else {
                    this.setState({alertStyle: "danger", showAlert: true, message: res.data.message});
                }

            })
            .catch(err => {console.log(err)});

        form.register_username.value = '';
        form.register_password.value = '';
        form.email.value = '';
        form.invitation.value = '';

        this.setState({
            usernameValidation: null,
            passwordValidation: null,
            emailValidation: null,
            invitationValidation: null});

    }

    render() {

        const pwHelp = (
            <HelpBlock>Password should be alphanumeric and at least 6-character long.</HelpBlock>
        );

        return (
            <div>
                <NavBar navBarBrand={navBarBrand} leftItems={[]} rightItems={rightItems} />

            <Modal show={this.state.showModal} onHide={this.closeModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Welcome</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>{this.state.message}</p>
                </Modal.Body>
                <Modal.Footer>
                    <Link to='/login'>
                        <Button className="btn-cardinal-orange btn-panel btn-panel-single">Login</Button>
                    </Link>
                </Modal.Footer>
            </Modal>

                <div className="panel-grid">
                    {this.state.showAlert ?
                        <Alert bsStyle={this.state.alertStyle} onDismiss={this.closeAlert}>
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
                                Register
                            </h1>
                            <hr />
                            <Form name="registerForm" onSubmit={this.register}>
                                <FormGroup validationState={this.state.usernameValidation}>
                                    <ControlLabel>Username</ControlLabel>
                                    <FormControl name="register_username"
                                                 autoFocus
                                                 placeholder="username"
                                                 onChange={this.validateUsername}/>
                                    <FormControl.Feedback />
                                    {this.state.usernameValidation === 'error' ?
                                        <HelpBlock>Username should be alphanumeric and not empty.
                                            You will not be able to change it after registration.</HelpBlock> : null
                                    }
                                </FormGroup>
                                <FormGroup validationState={this.state.emailValidation}>
                                    <ControlLabel>Email</ControlLabel>
                                    <FormControl name="email" placeholder="email" onChange={this.validateEmail}/>
                                    <FormControl.Feedback />
                                    {this.state.emailValidation === 'error' ?
                                        <HelpBlock>Wrong email format.
                                            You will not be able to change it after registration.</HelpBlock> : null
                                    }
                                </FormGroup>
                                <FormGroup validationState={this.state.passwordValidation}>
                                    <ControlLabel>Password</ControlLabel>
                                    <FormControl type="password"
                                                 name="register_password"
                                                 placeholder="password"
                                                 onChange={this.validatePassword}/>
                                    <FormControl.Feedback />
                                    {this.state.passwordValidation === 'error' ? pwHelp : null}
                                </FormGroup>
                                <FormGroup validationState={this.state.invitationValidation}>
                                    <ControlLabel>Invitation Code</ControlLabel>
                                    <FormControl name="invitation" placeholder="invitation code" onChange={this.validateInvCode}/>
                                    <FormControl.Feedback />
                                    {this.state.invitationValidation === 'error' ?
                                        <HelpBlock>Wrong invitation code format.</HelpBlock> : null
                                    }
                                </FormGroup>
                                <FormGroup>
                                    <ButtonToolbar>
                                        <Button type="submit" className="btn-cardinal-gray btn-panel btn-panel-single">Register</Button>
                                    </ButtonToolbar>
                                </FormGroup>
                            </Form>
                        </Col>
                        <Col md={3}>
                        </Col>
                    </Row>
                </div>
            </div>


        );
    };

}
