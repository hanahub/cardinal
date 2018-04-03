import React from 'react';
import {Alert, Row, Col} from 'react-bootstrap';
import axios from 'axios';
import NavBar from './navbar.jsx';
import KpiTable from './kpiTable.jsx';
import RankCollapsiblePanel from './rankCollapsiblePanel.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';


export default class TopPlayerReport extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showLoader: false,
            userId: '',
            userType: 0,
            playerReport: {mins: 1, phy_load: 1, mech_load: 1, dist: 1},
            playerSum: [{}],
            colNames: [],
            leagueReport: [{}],
            leagueReportColNames: [],
            showAlert: false,
            alertStyle: 'info',
            message: ''
        };

        this.getTopPlayerReport = this.getTopPlayerReport.bind(this);
        this.getPlayerSumReport = this.getPlayerSumReport.bind(this);
        this.getTopPlayerLeagueReport = this.getTopPlayerLeagueReport.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
    }

    closeAlert() {
        this.setState({showAlert: false});
    }

    getTopPlayerLeagueReport(userId) {

        if (this.state.userType === 1 || this.state.userType === -1) {
            axios.get('/api/user/' + userId + '/top_player_league_wide')
                .then(
                    res => {
                        if (res.data.status) {
                            this.setState({leagueReport: res.data.leagueReport, leagueReportColNames: res.data.colNames});
                        } else {
                            this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                        }
                    }
                )
                .catch((error) => {
                    console.log(error);
                });
        }
    }

    getPlayerSumReport(userId, teamId) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/top_player_sum')
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({playerSum: res.data.playerSum, colNames: res.data.colNames});
                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    displayLoader(timeDelay) {
        this.setState({showLoader: true});
        setTimeout(() => {
            this.setState({showLoader: false});
        }, timeDelay);
    }

    getTopPlayerReport(userId, teamId) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/top_player_report')
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({playerReport: res.data.playerReport});
                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch((error) => {
                console.log(error);
            });
    }

    componentWillMount () {
        let teamId = this.props.match.params.teamId;

        (async () => {

            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id, userType: parseInt(data.user_type)},
                    () => {
                        this.getTopPlayerReport(data.user_id, teamId);
                        this.getPlayerSumReport(data.user_id, teamId);
                        this.getTopPlayerLeagueReport(data.user_id);
                    });
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(1800);
    }

    render() {
        return (
            <PageLoader show={this.state.showLoader}>
                <NavBar navBarBrand={navBarBrand}
                        leftItems={this.props.match.params.teamId === 'SUM' ?
                            Util.updateLeftItemForLeagueUrl(Util.leftItemForLeague, this.props.match.params.teamId) :
                            Util.updateLeftItemUrl(Util.leftItems, this.props.match.params.teamId)}
                        rightItems={Util.rightItems}
                        historyCopy={this.props.history} />


                <div className="panel-grid animated fadeIn">
                    {this.state.showAlert ?
                        <Alert bsStyle={this.state.alertStyle} onDismiss={this.closeAlert}>
                            <p>{this.state.message}</p>
                        </Alert> : null
                    }

                    <h1>Top-6 Player Percentage</h1>
                    <hr />
                    <Row>
                        <Col sm={3} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="Percentage Minutes"
                                rank={this.state.playerReport.mins}
                                total={1}
                                color='#a0bf7c'/>
                        </Col>
                        <Col sm={3} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="Percentage Physio Load"
                                rank={this.state.playerReport.phy_load}
                                total={1}
                                color='#a0bf7c'/>
                        </Col>
                        <Col sm={3} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="Percentage Mechanical Load"
                                rank={this.state.playerReport.mech_load}
                                total={1}
                                color='#a0bf7c'/>
                        </Col>
                        <Col sm={3} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="Percentage Distance"
                                rank={this.state.playerReport.dist}
                                total={1}
                                color='#a0bf7c'/>
                        </Col>
                    </Row>

                    {this.state.userType === 1 || this.state.userType === -1 ?
                        <div>
                            <h1>Top-6 Player League Wide Report</h1>
                            <hr />
                            <KpiTable
                                csvFileName={this.props.match.params.teamId + "_top_player_league_report.csv"}
                                colNames={this.state.leagueReportColNames}
                                colorEncodedColNames={[]}
                                defaultPageSize={30}
                                data={this.state.leagueReport} />
                        </div>
                         : null
                    }

                    <h1>Player Sum Report</h1>
                    <hr />
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_player_sum_report.csv"}
                        colNames={this.state.colNames}
                        colorEncodedColNames={[]}
                        data={this.state.playerSum} />

                </div>
            </PageLoader>
        )
    }




}