import React from 'react';
import {Image, Row, Col, Form, FormGroup, ControlLabel, Alert, HelpBlock, FormControl} from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-bootstrap-date-picker';
import NavBar from './navbar.jsx';
import CollapsiblePanel from './collapsiblePanel.jsx';
import RankCollapsiblePanel from './rankCollapsiblePanel.jsx';
import KpiTable from './kpiTable.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';


export default class TeamDashBoard extends React.Component {
    constructor (props) {
        super(props);

        let d = new Date();
        d.setDate(d.getDate() - 1);

        this.state = {
            showLoader: false,
            userId: '',
            dateForData: d.toISOString(),
            teamName: '',
            teamLogo: '/img/img_not_found.png',
            teamInfo: {
                totalPhysioLoad: 0,
                totalPhysioColor: 'green',
                totalDistance: 0,
                totalDistanceColor: 'green',
                averageMechanicalIntensity: 0,
                averageMechanicalIntensityColor: 'green'},
            colorEncodedColNames: [],
            colNames: [],
            summaryData: [{}],
            showAlert: false,
            alertStyle: 'info',
            message: '',
            showNotice: false,
            notice: ''
        };

        this.closeAlert = this.closeAlert.bind(this);
        this.getTeamInfoByTeamId = this.getTeamInfoByTeamId.bind(this);
        this.getTeamInfoByDate = this.getTeamInfoByDate.bind(this);
        this.getTeamRankByTeamId = this.getTeamRankByTeamId.bind(this);


    }

    getTeamRankByTeamId(userId, teamId, date) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/rank', {
            params: {
                date: date
            }
        })
            .then((res) => {

                let status = res.data.status;
                if (status) {
                    this.setState({showNotice: false, teamInfo: res.data.teamInfo});
                } else {
                    this.setState({showNotice: true, teamInfo: res.data.teamInfo, notice: res.data.message});
                }

            })
            .catch((error) => {
                console.log(error);
            });
    }

    getTeamInfoByDate(date) {
        if (date) {
            let teamId = this.props.match.params.teamId;
            this.getTeamInfoByTeamId(this.state.userId, teamId, date);
            this.getTeamRankByTeamId(this.state.userId, teamId, date);
            this.setState({dateForData: date});
        }
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

    componentWillMount () {
        let teamId = this.props.match.params.teamId;

        (async () => {

            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id},
                    () => {
                        this.getTeamInfoByTeamId(data.user_id, teamId, this.state.dateForData);
                        this.getTeamRankByTeamId(data.user_id, teamId, this.state.dateForData);
                });
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(2000);
    }



    getTeamInfoByTeamId (userId, teamId, date) {

        axios.get('/api/user/' + userId + '/team/' + teamId, {
            params: {
                date: date
            }
        })
            .then((res) => {
                let status = res.data.status;

                if (status) {
                    if (res.data.warning) {
                        this.setState({
                            teamName: res.data.teamName,
                            teamLogo: res.data.teamLogo,
                            summaryData: res.data.summaryData,
                            showAlert: true,
                            alertStyle: 'warning',
                            message: res.data.message});
                    } else {
                        this.setState({
                            teamName: res.data.teamName,
                            teamLogo: res.data.teamLogo,
                            summaryData: res.data.summaryData,
                            colorEncodedColNames: res.data.colorEncodedColNames,
                            colNames: res.data.colNames});
                    }

                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }

            })
            .catch((error) => {
                console.log(error);
            });

    }

    render () {

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
                    <h1>{this.state.teamName} Dashboard</h1>
                    <hr />
                    <Form horizontal>
                        <FormGroup>
                            <Col componentClass={ControlLabel} md={1}>By Date</Col>
                            <Col md={5}>
                                <DatePicker value={this.state.dateForData} onChange={this.getTeamInfoByDate}/>

                                <HelpBlock>date of team summary data</HelpBlock>
                            </Col>

                        </FormGroup>
                    </Form>
                    {this.state.showNotice ? <p className="tip">{this.state.notice}</p> : null}
                    <hr />
                    <Row>
                        <Col sm={3} md={3}>
                            <CollapsiblePanel collapsible={true} header="Team">
                                <Image className="team-panel-img panel-center" src={this.state.teamLogo}/>
                            </CollapsiblePanel>
                        </Col>
                        <Col sm={3} md={3}>
                            <RankCollapsiblePanel
                                header="Total Physio Load"
                                reverseRank={true}
                                rank={this.state.teamInfo.totalPhysioLoad}
                                total={30}
                                color={this.state.teamInfo.totalPhysioLoadColor} />
                        </Col>
                        <Col sm={3} md={3}>
                            <RankCollapsiblePanel
                                header="Total Distance"
                                reverseRank={true}
                                rank={this.state.teamInfo.totalDistance}
                                total={30}
                                color={this.state.teamInfo.totalDistanceColor}/>
                        </Col>
                        <Col sm={3} md={3}>
                            <RankCollapsiblePanel
                                header="Average Mechanical Intensity"
                                reverseRank={true}
                                rank={this.state.teamInfo.averageMechanicalIntensity}
                                total={30}
                                color={this.state.teamInfo.averageMechanicalIntensityColor}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={12}>
                            <CollapsiblePanel collapsible={false} header="Key Performance Indicators">
                                <KpiTable
                                    csvFileName={this.state.teamName + "_team_summary.csv"}
                                    colNames={this.state.colNames}
                                    colorEncodedColNames={this.state.colorEncodedColNames}
                                    defaultSortId={'Minutes'}
                                    exportData={this.state.summaryData}
                                    data={this.state.summaryData} />
                                <p className="tip">Tip: Hold shift to multi-sort.</p>
                            </CollapsiblePanel>
                        </Col>
                    </Row>

                </div>
            </PageLoader>
        )
    }
}