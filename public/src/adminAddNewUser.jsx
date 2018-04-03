import React, { Component } from 'react';
import {HelpBlock, Form, FormGroup, FormControl, ControlLabel, Button, Alert} from 'react-bootstrap';
const bcrypt = require("bcrypt-nodejs");
import axios from 'axios';
import {Util} from './util.jsx';

export default class AdminAddnewUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            username: '',
            password: '',
            email: '',
            usertype: 1,
            userId: '',
            uuid: '',
            usernameValidation: null,
            passwordValidation: null,
            emailValidation: null,
            invitationValidation: null,

        };

        this.validateUsername = this.validateUsername.bind(this);
        this.validatePassword = this.validatePassword.bind(this);
        this.validateEmail = this.validateEmail.bind(this);
        this.validateInvCode = this.validateInvCode.bind(this);
        this.changeUserType = this.changeUserType.bind(this);
    }

    componentWillMount() {
        this.uuid(this.props.adminId);
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

        let res = (inv === this.state.uuid);
        if (res) {
            this.setState({userId: inv, invitationValidation: 'success'});
        } else {
            this.setState({invitationValidation: 'error'});
        }
    }

    checkPassword(e) {
        let i = 0, len = e.length, code = 0;

        if (len <= 0) return false;

        for (i = 0; i < len; i++) {
            code = e.charCodeAt(i);
            if (!(code > 47 && code < 58) && // numeric (0-9)
                !(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123)) { // lower alpha (a-z)
                return false;
            }
        }

        return true;
    }

    validatePassword(e) {
        let pw = e.target.value;

        let res = Util.checkAlphanumeric(pw) && pw.length >= 6;
        if (res) {
            this.setState({password: pw, passwordValidation: 'success'});
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
            this.setState({email: email, emailValidation: 'success'});
        } else {
            this.setState({emailValidation: 'error'});
        }
    }

    validateUsername(e) {
        let username = e.target.value;

        let res = Util.checkAlphanumeric(username);
        if (res) {
            this.setState({username: username, usernameValidation: 'success'});
        } else {
            this.setState({usernameValidation: 'error'});
        }
    }

    newUser(e) {
        e.preventDefault();
        let adminId = this.props.adminId;

        if (this.state.usernameValidation !== 'success' ||
            this.state.emailValidation !== 'success' ||
            this.state.passwordValidation !== 'success' ||
            this.state.invitationValidation !== 'success') {
            this.setState({alertStyle: "danger", showAlert: true, message: "Please check the validations first. "});
            return;
        }

        axios.post(`/api/admin/${adminId}/user`, {
            data: {
                user_id: this.state.userId,
                username: this.state.username,
                password: this.state.password,
                user_type: this.state.usertype,
                email: this.state.email
            }
        })
            .then(response => {
                this.props.getUsersInformation();
                this.uuid(this.props.adminId);

                this.setState({
                    alertStyle: 'success',
                    showAlert: true,
                    message: response.data.message
                })
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: response.data.message
                });
            });

        this.setState({
            username: '',
            password: '',
            email: '',
            usertype: 1,
            userId: '',
            usernameValidation: null,
            passwordValidation: null,
            emailValidation: null,
            invitationValidation: null,
        });

        let form = document.forms.newUser;
        form.username.value = '';
        form.password.value = '';
        form.email.value = '';
        form.usertype.value = 1;
        form.userId.value = '';
    };

    checkDuplicateUUID(newUUID) {
        let users = this.props.users;

        for(let i = 0; i < users.length; i++) {
            if(newUUID === users[i].user_id) {
                return this.uuid(this.props.adminId)
            } else {
                this.setState({
                    uuid: newUUID
                })
            }
        }
    }

    uuid(adminId) {
        axios.get(`/api/admin/${adminId}/uuid`)
            .then(response => {
                let uuid = response.data.uuid;
                this.checkDuplicateUUID(uuid)
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: error
                });
            })
    }

    changeUserType(e) {
        this.setState({ usertype: e.target.value });
    }

render() {
        return (
            <div>
                { this.state.showAlert ?
                    <Alert bsStyle={this.state.alertStyle} onDismiss={this.closeAlert}>
                        <p>{this.state.message}</p>
                    </Alert> : null
                }
                <Form name='newUser' className='admin-new-user'>
                    <h1>Add New User</h1>
                    <FormGroup validationState={this.state.usernameValidation}>
                        <ControlLabel className='admin-new-user-label'>Username</ControlLabel>
                        <FormControl className='add-new-user-form'
                                     type='text'
                                     onChange={this.validateUsername} placeholder='username' name='username'></FormControl>
                        <FormControl.Feedback />
                        {this.state.usernameValidation === 'error' ?
                            <HelpBlock>Username should be alphanumeric and not empty.</HelpBlock> : null
                        }
                    </FormGroup>
                    <FormGroup validationState={this.state.passwordValidation}>
                        <ControlLabel className='admin-new-user-label'>Password</ControlLabel>
                        <FormControl className='add-new-user-form'
                                     type='password'
                                     onChange={this.validatePassword} placeholder='password' name='password'></FormControl>
                        <FormControl.Feedback />
                        {this.state.passwordValidation === 'error' ?
                            <HelpBlock>Passowrd should be alphanumeric and at least 6-character long.</HelpBlock> : null
                        }
                    </FormGroup>

                    <FormGroup validationState={this.state.emailValidation}>
                        <ControlLabel className='admin-new-user-label'>Email</ControlLabel>
                        <FormControl className='add-new-user-form'
                                     type='email'
                                     onChange={this.validateEmail} placeholder='email' name='email'></FormControl>
                        <FormControl.Feedback />
                        {this.state.emailValidation === 'error' ?
                            <HelpBlock>Wrong email format.</HelpBlock> : null
                        }
                    </FormGroup>
                    <FormGroup>
                        <ControlLabel className='admin-new-user-label'>User Type</ControlLabel>
                        <FormControl className='add-new-user-form'
                                     componentClass="select"
                                     onChange={this.changeUserType}
                                     placeholder='usertype' name='usertype'>
                            <option value={1}>multi-teams</option>
                            <option value={2}>single-team</option>
                            <option value={-1}>admin</option>
                        </FormControl>
                    </FormGroup>
                    <FormGroup validationState={this.state.invitationValidation}>
                        <ControlLabel className='admin-new-user-label'>User ID</ControlLabel>
                        <FormControl className='add-new-user-form'
                                     type='text'
                                     onChange={this.validateInvCode} placeholder='user ID' name="userId"></FormControl>
                        <FormControl.Feedback />
                        {this.state.invitationValidation === 'error' ?
                            <HelpBlock>Please use the UUID below.</HelpBlock> : null
                        }
                    </FormGroup>

                    <FormGroup>
                        <ControlLabel className='admin-new-user-label'>UUID: { this.state.uuid }</ControlLabel>
                        <HelpBlock>Copy and paste to use the UUID as new User ID. </HelpBlock>
                    </FormGroup>
                    <Button className='btn-cardinal-orange admin-button' onClick={ this.newUser.bind(this) }>Submit</Button>
                </Form>
            </div>
        )
    }
}