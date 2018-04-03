import React, { Component } from 'react';
import { Button, Table, Alert } from 'react-bootstrap';
import axios from 'axios';

export default class AdminUserTeams extends Component {
    constructor() {
        super();
        this.state = {
            userId: '',
            username: '',
            email: '',
            users: [],
            teams: [],
            userType: null,
            displayUsers: true,
            displayTeams: false,
            alertStyle: "success",
            showAlert: false,
        };
    }

    componentWillMount() {
        this.getUsersInformation();
    }

    closeAlert() {
        this.setState({showAlert: false});
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
                    message: 'We were not able to retrieve users'
                });
            });

        this.setState({
            displayUsers: true,
            displayTeams: false
        });
    }

    getUserLoggedIn(user) {
        let userId = user.user_id;

        axios.get('/api/logged_in')
            .then(response => {
                if (response.status) {
                    this.getTeamInformation(userId);
                }
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: 'An Error occurred'
                });
            });

        this.setState({
            userId: user.user_id,
            username: user.username,
            email: user.email,
            userType: user.user_type
        });
    }

    getTeamInformation(userId) {
        axios.get(`/api/user/${userId}`)
            .then(response => {
                let status = response.data.status;
                if(status) {
                    this.setState({
                        teams: response.data.teams,
                        displayTeams: true,
                        displayUsers: false
                    });
                } else {
                    this.setState({
                        alertStyle: "danger",
                        showAlert: true,
                        message: response.data.message
                    });
                }
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: 'We were not able to retrieve team information'
                });
            });
    }

    removeTeamFromUser(userId, teamId) {
        let adminId = this.props.adminId;

        axios.delete(`/api/admin/${adminId}/user/${userId}/team/${teamId}`)
            .then(response => {
                if(response.data.status) {
                    this.getTeamInformation(userId);
                    this.setState({
                        alertStyle: 'success',
                        showAlert: true,
                        message: response.data.message
                    });
                } else {
                    this.setState({
                        alertStyle: "danger",
                        showAlert: true,
                        message: response.data.message
                    });
                }
            })
            .catch(error => {
                this.setState({
                    alertStyle: "danger",
                    showAlert: true,
                    message: 'There was an error while removing access to this team'
                });
            })
    }

    addUserIdAndTeamToDatabase(userId, team, league, teamAbbr) {
        let adminId = this.props.adminId;

        axios.post(`/api/admin/${adminId}/user/${userId}/team`, {
            data: {
                user_id: userId,
                team: team,
                league: league,
                team_abbr: teamAbbr
            }
        })
            .then(response => {
                this.getTeamInformation(userId);
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
                    message: 'There was an error adding team access'
                });
            });
    };

    getUser() {
        return this.state.users.map(user =>
            <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.last_login_time}</td>
                <td><Button className='btn-cardinal-orange' bsSize="small" onClick={ () => this.getUserLoggedIn(user) }>View Teams</Button></td>
            </tr>
        );
    }

    getTeamList() {
        return this.state.teams.map(team =>
            <tr key={team.teamId}>
                <td>{team.league}</td>
                <td>{team.team}</td>
                <td><Button className='btn-cardinal-orange' bsSize="small" onClick={ () => this.removeTeamFromUser(this.state.userId, team.team) }>Remove Team</Button></td>
            </tr>
        );
    }

    render() {
        return (
            <section>
                <article>
                    { this.state.showAlert ?
                        <Alert bsStyle={this.state.alertStyle} onDismiss={() => this.closeAlert()}>
                            <p>{this.state.message}</p>
                        </Alert> : null
                    }
                    { this.state.displayUsers &&
                    <Table>
                        <thead>
                        <tr>
                            <th>User Id</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Last Login</th>
                            <th>Teams User Has Access To</th>
                        </tr>
                        </thead>
                        <tbody>
                        { this.getUser() }
                        </tbody>
                    </Table>
                    }
                </article>

                <article className='add-team-article'>
                    <div className='add-team-article-div'>
                        { this.state.displayTeams &&
                        <Table>
                            <thead>
                            <tr>
                                <th>League</th>
                                <th>Team</th>
                                <th>Remove Access</th>
                            </tr>
                            </thead>
                            <tbody>
                            { this.getTeamList() }
                            </tbody>
                        </Table>
                        }
                    </div>
                    <div>
                        { this.state.displayTeams &&
                        <nav className='add-team-nav'>
                            <h2 className='add-team-header'>Add Team Access</h2>
                            <hr className='add-team-header-hr'/>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Atlanta Hawks', 'NBA', 'ATL') }>ATL</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Boston Celtics', 'NBA', 'BOS') }>BOS</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Brooklyn Nets', 'NBA', 'BKN') }>BKN</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Charlotte Hornets', 'NBA', 'CHA') }>CHA</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Chicago Bulls', 'NBA', 'CHI') }>CHI</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Cleveland Cavaliers', 'NBA', 'CLE') }>CLE</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Dallas Mavericks', 'NBA', 'DAL') }>DAL</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Denver Nuggets', 'NBA', 'DEN') }>DEN</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Detroit Pistons', 'NBA', 'DET') }>DET</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Golden State Warriors', 'NBA', 'GSW') }>GSW</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Houston Rockets', 'NBA', 'HOU') }>HOU</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Indiana Pacers', 'NBA', 'IND') }>IND</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Los Angeles Clippers', 'NBA', 'LAC') }>LAC</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Los Angeles Lakers', 'NBA', 'LAL') }>LAL</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Memphis Grizzlies', 'NBA', 'MEM') }>MEM</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Miami Heat', 'NBA', 'MIA') }>MIA</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Milwaukee Bucks', 'NBA', 'MIL') }>MIL</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Minnesota Timberwolves', 'NBA', 'MIN') }>MIN</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'New Orleans Pelicans', 'NBA', 'NOP') }>NOP</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'New York Knicks', 'NBA', 'NYK') }>NYK</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Oklahoma City Thunder', 'NBA', 'OKC') }>OKC</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Orlando Magic', 'NBA', 'ORL') }>ORL</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Philadelphia 76ers', 'NBA', 'PHI') }>PHI</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Phoenix Suns', 'NBA', 'PHX') }>PHX</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Portland Trail Blazers', 'NBA', 'POR') }>POR</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Sacramento Kings', 'NBA', 'SAC') }>SAC</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'San Antonio Spurs', 'NBA', 'SAS') }>SAS</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Utah Jazz', 'NBA', 'UTA') }>UTA</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'Washington Wizards', 'NBA', 'WAS') }>WAS</Button>
                            <Button className='btn-cardinal-orange admin-button' onClick={ () => this.addUserIdAndTeamToDatabase(this.state.userId, 'League Summary', 'NBA', 'SUM') }>SUM</Button>
                        </nav>
                        }
                    </div>
                </article>
            </section>
        )
    }
}