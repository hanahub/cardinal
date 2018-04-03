import React, { Component } from 'react';
import { Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

export default class AdminDeleteUsers extends Component {
    constructor(props) {
        super(props);
        this.state = {
            alertStyle: "success",
            showAlert: false,
            deleteAlert: false,
        };
    }

    deleteUser(userId) {
        let adminId = this.props.adminId;
        axios.delete(`/api/admin/${adminId}/user/${userId}`)
            .then(response => {
                if(response.data.status) {
                    this.props.getUsersInformation();

                    this.setState({
                        alertStyle: 'success',
                        showAlert: true,
                        message: response.data.message
                    })
                } else {
                    this.setState({
                        alertStyle: "danger",
                        showAlert: true,
                        message: response.data.message
                    })
                }
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: response.data.message
                })
            })
    }

    getUser() {
        return this.props.users.map(user =>
            <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.last_login_time}</td>
                <td><Button className='btn-cardinal-orange' bsSize="small" onClick={() => this.deleteUser(user.user_id) }>Remove User</Button></td>
            </tr>
        );
    }

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
                        <th>Remove User From Database</th>
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