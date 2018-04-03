import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import axios from 'axios';
const bcrypt = require('bcrypt-nodejs');

import AdminAddNewUser from './adminAddNewUser.jsx';
import ResetUser from './adminResetUser.jsx';
import AdminDeleteUsers from './adminDeleteUsers.jsx';
import AdminUserTeams from './adminUserTeams.jsx';

export default class Admin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            displayNewUserForm: false,
            displayResetForm: false,
            displayUsers: false,
            displayUserTeams: false,
            users: [],
        };
    }

    componentWillMount() {
        this.getUsersInformation();
    }

    getUsersInformation() {
        let adminId = this.props.adminId;

        axios.get(`/api/admin/${adminId}/users`)
            .then(response => {
                this.setState({ users: response.data.users });
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: 'Error returning all users'
                })
            })
    }

    toggleAddNewUserForm(e) {
        e.preventDefault();
        this.setState({
            displayNewUserForm: !this.state.displayNewUserForm,
            displayResetForm: false,
            displayUsers: false,
            displayUserTeams: false
        });
    }

    toggleResetCredintialsForm(e) {
        e.preventDefault();
        this.setState({
            displayResetForm: !this.state.displayResetForm,
            displayNewUserForm: false,
            displayUsers: false,
            displayUserTeams: false
        });
    }

    toggleUsers(e) {
        e.preventDefault();
        this.setState({
            displayUsers: !this.state.displayUsers,
            displayNewUserForm: false,
            displayResetForm: false,
            displayUserTeams: false
        });
    }

    toggleUsersTeams(e) {
        e.preventDefault();
        this.setState({
            displayUserTeams: !this.state.displayUserTeams,
            displayNewUserForm: false,
            displayResetForm: false,
            displayUsers: false
        });
    }

    render() {
        return (
            <section className='admin-section'>
                <h1>Admin</h1>
                <hr />
                <article className='admin-article-button'>
                    <Button className='btn-cardinal-orange admin-button' onClick={ this.toggleAddNewUserForm.bind(this) }>Add New User</Button>
                    <Button className='btn-cardinal-orange admin-button' onClick={ this.toggleResetCredintialsForm.bind(this) }>Reset User Credentials</Button>
                    <Button className='btn-cardinal-orange admin-button' onClick={ this.toggleUsers.bind(this) }>Delete A User</Button>
                    <Button className='btn-cardinal-orange admin-button' onClick={ this.toggleUsersTeams.bind(this) }>Display Users Teams</Button>
                </article>
                <article className='admin-article-content'>
                    { this.state.displayNewUserForm &&
                    <AdminAddNewUser
                        adminId={ this.props.adminId }
                        users={ this.state.users }
                        getUsersInformation={ () => this.getUsersInformation() }
                    />
                    }
                    { this.state.displayResetForm &&
                    <ResetUser
                        adminId={ this.props.adminId }
                        users={ this.state.users }
                        getUsersInformation={ () => this.getUsersInformation() }
                    />
                    }
                    { this.state.displayUsers &&
                    <AdminDeleteUsers
                        adminId={ this.props.adminId }
                        users={ this.state.users }
                        getUsersInformation={ () => this.getUsersInformation() }
                    />
                    }
                    { this.state.displayUserTeams &&
                    <AdminUserTeams
                        adminId={ this.props.adminId }
                    />
                    }
                </article>
            </section>
        )
    };
}