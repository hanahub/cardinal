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
            playerReportC: [{}],
            colNamesC: [],
            playerReportSF: [{}],
            colNamesSF: [],
            playerReportPF: [{}],
            colNamesPF: [],
            playerReportSG: [{}],
            colNamesSG: [],
            playerReportPG: [{}],
            colNamesPG: [],
            showAlert: false,
            alertStyle: 'info',
            message: ''
        };

        this.getTopPlayerReport = this.getTopPlayerReport.bind(this);

        this.closeAlert = this.closeAlert.bind(this);
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

    getTopPlayerReport(userId, teamId, position) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/top_player_position', {params: {position: position}})
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    if (position === 'C') {this.setState({playerReportC: res.data.playerReport, colNamesC: res.data.colNames});}
                    if (position === 'SF') {this.setState({playerReportSF: res.data.playerReport, colNamesSF: res.data.colNames});}
                    if (position === 'PF') {this.setState({playerReportPF: res.data.playerReport, colNamesPF: res.data.colNames});}
                    if (position === 'SG') {this.setState({playerReportSG: res.data.playerReport, colNamesSG: res.data.colNames});}
                    if (position === 'PG') {this.setState({playerReportPG: res.data.playerReport, colNamesPG: res.data.colNames});}

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
                        this.getTopPlayerReport(data.user_id, teamId, 'C');
                        this.getTopPlayerReport(data.user_id, teamId, 'SF');
                        this.getTopPlayerReport(data.user_id, teamId, 'PF');
                        this.getTopPlayerReport(data.user_id, teamId, 'SG');
                        this.getTopPlayerReport(data.user_id, teamId, 'PG');
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

                    <h1>Top-10 Player Report By Position</h1>
                    <hr />
                    <h2>Center</h2>
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_top10_player_C.csv"}
                        colNames={this.state.colNamesC}
                        colorEncodedColNames={[]}
                        data={this.state.playerReportC} />

                    <h2>Power Forward</h2>
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_top10_player_PF.csv"}
                        colNames={this.state.colNamesPF}
                        colorEncodedColNames={[]}
                        data={this.state.playerReportPF} />

                    <h2>Small Forward</h2>
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_top10_player_SF.csv"}
                        colNames={this.state.colNamesSF}
                        colorEncodedColNames={[]}
                        data={this.state.playerReportSF} />

                    <h2>Shooting Guard</h2>
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_top10_player_SG.csv"}
                        colNames={this.state.colNamesSG}
                        colorEncodedColNames={[]}
                        data={this.state.playerReportSG} />

                    <h2>Point Guard</h2>
                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_top10_player_PG.csv"}
                        colNames={this.state.colNamesPG}
                        colorEncodedColNames={[]}
                        data={this.state.playerReportPG} />

                </div>
            </PageLoader>
        )
    }




}