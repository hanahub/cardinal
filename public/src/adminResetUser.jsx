import React, { Component } from 'react';
import { Button, Alert, Table } from 'react-bootstrap';
const bcrypt = require("bcrypt-nodejs");
import axios from 'axios';

export default class ResetUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alertStyle: "success",
            showAlert: false,
        };
    }


    getUser() {
        return this.props.users.map(user =>
            <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.last_login_time}</td>
                <td>{user.login_failure}</td>
                <td><Button className='btn-cardinal-orange' bsSize="small" onClick={() => this.resetCredentials(user.user_id) }>Reset User</Button></td>
                <td><Button className='btn-cardinal-orange' bsSize="small" onClick={() => this.clearLoginFailure(user.username) }>Clear Login Failure</Button></td>
            </tr>
        );
    }

    clearLoginFailure(username) {
        let adminId = this.props.adminId;
        axios.put(`/api/admin/${adminId}/user/${username}`)
            .then(response => {
                this.props.getUsersInformation();

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
                })
            });
    }

    resetCredentials(userId) {
        let adminId = this.props.adminId;
        axios.patch(`/api/admin/${adminId}/user/${userId}`, {
            data: {
                username: '',
                email: '',
                user_type: 1,
                password: ''
            }
        })
            .then(response => {
                this.props.getUsersInformation();

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
                })
            });
    };

    render() {
        return (
            <div>
                { this.state.showAlert ?
                    <Alert bsStyle={this.state.alertStyle} onDismiss={this.closeAlert}>
                        <p>{this.state.message}</p>
                    </Alert> : null
                }
                <Table>
                    <thead>
                    <tr>
                        <th>User Id</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Last Login</th>
                        <th>Login Failure</th>
                        <th>Reset</th>
                    </tr>
                    </thead>
                    <tbody>
                    { this.getUser() }
                    </tbody>
                </Table>
            </div>
        )
    }
}