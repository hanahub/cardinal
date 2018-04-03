import React from 'react';
import {
    Table,
    Form,
    HelpBlock,
    FormGroup,
    FormControl,
    ControlLabel,
    Button,
    ButtonToolbar,
    DropdownButton,
    MenuItem,
    Row,
    Col,
    Alert} from 'react-bootstrap';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Link} from 'react-router-dom';
import axios from 'axios';
import Admin from './admin.jsx';
import {IndexLinkContainer} from 'react-router-bootstrap';
import {Util} from './util.jsx';


class ProfilePanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            showLoader: false,
            alertStyle: "success",
            userId: '',
            username: '',
            email: '',
            userType: '',
            teams: [],
            showAlert: false,
            message: '',
            adminId: '',
            newPasswordValidation: null,
            confirmPasswordValidation: null,
        };
        this.updatePassword = this.updatePassword.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.validateNewPassword = this.validateNewPassword.bind(this);
        this.validateConfirmPassword = this.validateConfirmPassword.bind(this);

    }

    closeAlert() {
        this.setState({showAlert: false});
    }

    displayLoader(timeDelay) {
        this.setState({showLoader: true});
        setTimeout(() => {
            this.setState({showLoader: false});
        }, timeDelay);
    }

    validateNewPassword(e) {
        let pw = e.target.value;

        let res = Util.checkAlphanumeric(pw) && pw.length >= 6;
        if (res) {
            this.setState({newPasswordValidation: 'success'});
        } else {
            this.setState({newPasswordValidation: 'error'});
        }
    }

    validateConfirmPassword(e) {
        let pw = e.target.value;

        let res = Util.checkAlphanumeric(pw) && pw.length >= 6;
        if (res) {
            this.setState({confirmPasswordValidation: 'success'});
        } else {
            this.setState({confirmPasswordValidation: 'error'});
        }
    }

    componentWillMount() {

        (async () => {

            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id, username: data.username, email: data.email},
                    this.getUserTeamInfoWithUserId(data.user_id),
                    this.retrieveUserType(data.user_id)
                );
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(800);
    }

    retrieveUserType(userId) {
        axios.get(`/api/user/${userId}/usertype`)
            .then(response => {
                if(response.data.user_type === -1) {
                    this.setState({ adminId: userId })
                }

                this.setState({ userType: response.data.user_type });
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: 'An Error occurred while retrieving user type'
                })
            })
    }

    getUsersInformation() {
        let userId = this.props.userId;

        axios.get(`/api/admin/${userId}/users`)
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

    getUserTeamInfoWithUserId(userId) {

        axios.get('/api/user/' + userId)
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({teams: res.data.teams});
                } else {
                    this.setState({alertStyle: "danger", showAlert: true, message: res.data.message});
                }
            })
            .catch(err => {console.log(err)});

    }

    getTeamList() {
        let userId = this.state.userId;

        return this.state.teams.map(team => {
                return (
                    <tr key={team.teamId}>
                        <td>{team.league}</td>
                        <td>{team.team}</td>
                        <td>
                            <ButtonToolbar>
                                <Link to={'/team/' + team.teamId}><span className="btn btn-info btn-xs margin-right-7px margin-left-7px">Summary</span></Link>
                                {team.teamId === 'SUM' ? null : <Link to={'/team/' + team.teamId + '/player'}><span className="btn btn-warning btn-xs margin-right-2px">player</span></Link>}
                                {team.teamId === 'SUM' ? null :
                                <DropdownButton className="btn btn-danger btn-xs margin-right-7px" title="report" id={team.teamId+'-dropdown'}>
                                    <IndexLinkContainer key={1} to={'/team/' + team.teamId + '/training_report'}>
                                        <MenuItem eventKey="1">Training</MenuItem>
                                    </IndexLinkContainer>
                                    <IndexLinkContainer key={2} to={'/team/' + team.teamId + '/prediction_report'}>
                                        <MenuItem eventKey="2">Prediction</MenuItem>
                                    </IndexLinkContainer>
                                    <IndexLinkContainer key={3} to={'/team/' + team.teamId + '/cardinal_report'}>
                                        <MenuItem eventKey="3">Performance</MenuItem>
                                    </IndexLinkContainer>
                                    <IndexLinkContainer key={4} to={'/team/' + team.teamId + '/ngames_report'}>
                                        <MenuItem eventKey="4">N-games</MenuItem>
                                    </IndexLinkContainer>
                                    <IndexLinkContainer key={5} to={'/team/' + team.teamId + '/top_player_report'}>
                                        <MenuItem eventKey="5">Top-player</MenuItem>
                                    </IndexLinkContainer>
                                    <IndexLinkContainer key={6} to={'/team/' + team.teamId + '/top_player_position'}>
                                        <MenuItem eventKey="6">Top-player position</MenuItem>
                                    </IndexLinkContainer>
                                </DropdownButton>}

                                {team.teamId === 'SUM' ? null :
                                    <Link to={'/team/' + team.teamId + '/visualization'}>
                                        <span className="btn btn-success btn-xs margin-right-7px">Visualization</span>
                                    </Link>}

                            </ButtonToolbar>
                        </td>
                    </tr>
                )
            }

        );
    }

    updatePassword (e) {
        e.preventDefault();
        let userId = this.state.userId;
        let form = document.forms.updatePasswordForm;

        if (this.state.newPasswordValidation !== 'success' ||
            this.state.confirmPasswordValidation !== 'success') {
            this.setState({alertStyle: "danger", showAlert: true, message: "Please check the validations first. "});
            return;
        }

        axios.put('/api/user/' + userId, {
            data: {
                username: form.username.value,
                old_password: form.old_password.value,
                new_password: form.new_password.value,
                confirm_password: form.confirm_password.value,
                email: form.email.value,
            }})
            .then((res) => {

                let status = res.data.status;
                if (status) {
                    this.setState({alertStyle: "success", showAlert: true, message: res.data.message});

                } else {
                    this.setState({alertStyle: "danger", showAlert: true, message: res.data.message});
                }

            })
            .catch(err => {console.log(err)});

        form.old_password.value = '';
        form.new_password.value = '';
        form.confirm_password.value = '';

        this.setState({
            oldPasswordValidation: null,
            newPasswordValidation: null,
            confirmPasswordValidation: null});
    }

    render() {

        const pwHelp = (
            <HelpBlock>Password should be alphanumeric and at least 6-character long.</HelpBlock>
        );

        return (
            <PageLoader show={this.state.showLoader}>
                <NavBar navBarBrand={navBarBrand} leftItems={[]} rightItems={Util.rightItems} historyCopy={this.props.history} />

                <div className="panel-grid animated fadeIn">
                    {this.state.showAlert ?
                        <Alert bsStyle={this.state.alertStyle} onDismiss={this.closeAlert}>
                            <p>{this.state.message}</p>
                        </Alert> : null
                    }
                    <Row>

                        <Col sm={6} md={6}>
                            <h1>Profile</h1>
                            <hr />
                            <Form name="updatePasswordForm" onSubmit={this.updatePassword}>
                                <FormGroup>
                                    <ControlLabel>Username</ControlLabel>
                                    <FormControl name="username" value={this.state.username} disabled/>
                                </FormGroup>
                                <FormGroup>
                                    <ControlLabel>Email</ControlLabel>
                                    <FormControl name="email" value={this.state.email} disabled/>
                                </FormGroup>

                                <FormGroup>
                                    <ControlLabel>Old Password</ControlLabel>
                                    <FormControl type="password"
                                                 name="old_password"
                                                 placeholder="old password"/>
                                </FormGroup>
                                <FormGroup validationState={this.state.newPasswordValidation}>
                                    <ControlLabel>New Password</ControlLabel>
                                    <FormControl type="password"
                                                 name="new_password"
                                                 placeholder="new password"
                                                 onChange={this.validateNewPassword}/>
                                    <FormControl.Feedback />
                                    {this.state.newPasswordValidation === 'error' ? pwHelp : null}
                                </FormGroup>
                                <FormGroup validationState={this.state.confirmPasswordValidation}>
                                    <ControlLabel>Confirm Password</ControlLabel>
                                    <FormControl type="password"
                                                 name="confirm_password"
                                                 placeholder="confirm new password"
                                                 onChange={this.validateConfirmPassword}/>
                                    <FormControl.Feedback />
                                    {this.state.confirmPasswordValidation === 'error' ? pwHelp : null}
                                </FormGroup>
                                <FormGroup>
                                    <ButtonToolbar>
                                        <Button type="submit" block className="btn-cardinal-orange btn-panel btn-panel-single">Update</Button>
                                    </ButtonToolbar>
                                </FormGroup>
                            </Form>
                        </Col>

                        <Col sm={6} md={6}>
                            <h1>Team</h1>
                            <hr />
                            <p className="tip">Sports teams for analytics</p>
                            <Table responsive striped bordered condensed hover>
                                <thead>
                                <tr>
                                    <th>League</th>
                                    <th>Team</th>
                                    <th>Link</th>
                                </tr>
                                </thead>
                                <tbody>
                                {this.getTeamList()}
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    { this.state.adminId &&
                    <Admin adminId={ this.state.adminId }/>
                    }

                </div>
            </PageLoader>
        );
    };

}


export default ProfilePanel;
