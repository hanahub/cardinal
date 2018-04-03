import React from 'react';
import {Image, Row, Col, Form, FormGroup, FormControl, Alert, ControlLabel, HelpBlock, Button} from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import axios from 'axios';
import NavBar from './navbar.jsx';
import CollapsiblePanel from './collapsiblePanel.jsx';
import RankCollapsiblePanel from './rankCollapsiblePanel.jsx';
import KpiTable from './kpiTable.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';


export default class PlayerDashBoard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            userId: '',
            showLoader: false,
            dateForData: '',
            showAlert: false,
            alertStyle: 'info',
            showNotice: false,
            notice: '',
            season: [],
            minDate: '',
            maxDate: '',
            playerList: [],
            playerImage: '/img/img_not_found.png',
            playerInfo: {
                sevenDayAverageMechanicalIntensity: 0,
                sevenDayAverageMechanicalIntensityUpper: 0,
                sevenDayAverageMechanicalIntensityLower: 0,
                sevenDayAverageMechanicalIntensityColor: 'orange',

                sevenDayAveragePhysioLoad: 0,
                sevenDayAveragePhysioLoadUpper: 0,
                sevenDayAveragePhysioLoadLower: 0,
                sevenDayAveragePhysioLoadColor: 'orange',

                sevenDayAverageAccel3PerMinute: 0,
                sevenDayAverageAccel3PerMinuteUpper: 0,
                sevenDayAverageAccel3PerMinuteLower: 0,
                sevenDayAverageAccel3PerMinuteColor: 'orange',

                sevenDayAveragePER: 0,
                sevenDayAveragePERUpper: 0,
                sevenDayAveragePERLower: 0,
                sevenDayAveragePERColor: 'orange',

                fourteenDayAcuteChronicMechanicalIntensity: 0,
                fourteenDayAcuteChronicMechanicalIntensityColor: 'orange',

                fourteenDayAcuteChronicPhysioLoad: 0,
                fourteenDayAcuteChronicPhysioLoadColor: 'orange',
            },
            playerName: 'Player Summary',
            colorEncodedColNames: [],
            colNames: [],
            summaryData: [{}],
            exportedQuarterData: [{}],
            quarterData: [{}]
        };

        this.closeAlert = this.closeAlert.bind(this);
        this.getPlayerInfoByPlayerId = this.getPlayerInfoByPlayerId.bind(this);
        this.getQuarterDataByPlayerId = this.getQuarterDataByPlayerId.bind(this);
        this.getPlayerListByTeamId = this.getPlayerListByTeamId.bind(this);
        this.getGaugeByPlayerId = this.getGaugeByPlayerId.bind(this);
        this.updateDate = this.updateDate.bind(this);
        this.searchPlayerInfo = this.searchPlayerInfo.bind(this);
        this.getSeason = this.getSeason.bind(this);
        this.setDateBound = this.setDateBound.bind(this);

    }

    displayLoader(timeDelay) {
        this.setState({showLoader: true});
        setTimeout(() => {
            this.setState({showLoader: false});
        }, timeDelay);
    }

    getSeason() {

            axios.get('/api/season')
                .then(
                    (res) => {

                        if (res.data.status) {
                            let seasons = res.data.season;

                            let start = seasons[0].start_date;
                            let end = seasons[0].end_date;
                            let yesterday = new Date();
                            yesterday.setDate(yesterday.getDate() - 1);
                            let startDate = new Date(start);
                            let endDate = new Date(end);

                            let dateToDisplay = (yesterday >= startDate && yesterday <= endDate) ? yesterday.toISOString() : endDate.toISOString();

                            this.setState({season: seasons, minDate: startDate.toISOString(), maxDate: endDate.toISOString(), dateForData: dateToDisplay});
                        } else {
                            this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                        }
                    })
                .catch(
                    (err) => {console.log(err)}
                )

    }

    setDateBound(e) {
        let ind = e.target.selectedIndex;

        let start = e.target.value;
        let end = this.state.season[ind].end_date;
        let today = new Date();
        let startDate = new Date(start);
        let endDate = new Date(end);

        let teamId = this.props.match.params.teamId;
        let dateToDisplay = (today >= startDate && today <= endDate) ? today.toISOString() : endDate.toISOString();
        this.setState({minDate: startDate.toISOString(), maxDate: endDate.toISOString(), dateForData: dateToDisplay});

        this.getPlayerListByTeamId(this.state.userId, teamId, this.state.season[ind].season, false);

    }



    searchPlayerInfo() {
        let form = document.forms.playerForm;

        let date = form.date.value;
        let player = form.player.value;

        this.getPlayerInfoByPlayerId(this.state.userId, player, this.state.minDate, date);
        this.getQuarterDataByPlayerId(this.state.userId, player, this.state.minDate, date);

        this.displayLoader(3000);

    }

    updateDate(value) {
        if (value) {
            this.setState({dateForData: value});
        }
    }

    closeAlert() {
        this.setState({showAlert: false});
    }

    componentWillMount() {

        let teamId = this.props.match.params.teamId;

        this.getSeason();

        (async () => {

            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id}, this.getPlayerListByTeamId(data.user_id, teamId, '2017-18', true));
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(3000);
    }


    mapToOptions(list, keyMap, valueKey, contentKey) {
        return list.map(item => {
              return  <option key={item[keyMap]} value={item[valueKey]}>{item[contentKey]}</option>;
        });
    }


    getPlayerListByTeamId(userId, teamId, season, ins_flag) {
        let playerList = [];

        axios.get('/api/user/' + userId + '/team/' + teamId + '/player', {params: {season: season}})
            .then((res) => {
                playerList = res.data.playerList;
                this.setState({playerList: playerList},
                    () => {
                        if (ins_flag) {
                            this.getPlayerInfoByPlayerId(this.state.userId, playerList[0].player, this.state.minDate, this.state.dateForData);
                            this.getQuarterDataByPlayerId(this.state.userId, playerList[0].player, this.state.minDate, this.state.dateForData);
                        }
                    });
            })
            .catch((error) => {
                console.log(error);
            });

    }

    getGaugeByPlayerId(userId, playerId, date) {
        let teamId = this.props.match.params.teamId;

        axios.get('/api/user/' + userId + '/team/' + teamId + '/player/' + playerId + '/gauge', {
            params: {date: date}
        })
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    if (res.data.notice) {
                        this.setState({
                            showNotice: true,
                            notice: res.data.message,
                            playerInfo: res.data.playerInfo});
                    } else {
                        this.setState({playerInfo: res.data.playerInfo, showNotice: false});
                    }
                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getPlayerInfoByPlayerId(userId, playerId, start_date, end_date) {
        let teamId = this.props.match.params.teamId;

        axios.get('/api/user/' + userId + '/team/' + teamId + '/player/' + playerId, {
            params: {start_date: start_date, end_date: end_date}
        })
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.getGaugeByPlayerId(userId, playerId, end_date);
                    if (res.data.warning) {
                        this.setState({
                            showAlert: true,
                            playerName: res.data.playerName,
                            playerImage: res.data.playerImage,
                            summaryData: res.data.summaryData,
                            alertStyle: 'warning',
                            message: res.data.message});
                    } else {
                        this.setState({
                            summaryData: res.data.summaryData,
                            playerName: res.data.playerName,
                            playerImage: res.data.playerImage,
                            colorEncodedColNames: res.data.colorEncodedColNames,
                            colNames: res.data.colNames});
                    }

                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
    }

    getQuarterDataByPlayerId(userId, playerId, start_date, end_date) {
        let teamId = this.props.match.params.teamId;

        axios.get('/api/user/' + userId + '/team/' + teamId + '/player/' + playerId + '/quarter', {
            params: {start_date: start_date, end_date: end_date}
        })
            .then((res) => {
                let status = res.data.status;

                if (status) {
                    if (res.data.warning) {
                        this.setState({
                            showAlert: true,
                            alertStyle: 'warning',
                            message: res.data.message});
                    } else {
                        this.setState({
                            exportedQuarterData: res.data.exportedQuarterData,
                            quarterData: res.data.quarterData});
                    }

                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch(function (error) {
                console.log(error);
            });
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

                    <h1>{this.state.playerName} Dashboard</h1>

                    <hr />
                    <Form name="playerForm" horizontal>
                        <FormGroup>
                            <Col componentClass={ControlLabel} md={1}>Season</Col>
                            <Col md={2}>
                                <FormControl name="season" componentClass="select" onChange={this.setDateBound}>
                                    {this.mapToOptions(this.state.season, 'end_date', 'start_date', 'season')}
                                </FormControl>
                                <HelpBlock>Select the season you are interested in first. </HelpBlock>
                            </Col>
                            <Col componentClass={ControlLabel} md={1}>By Date</Col>
                            <Col md={2}>
                                <DatePicker name="date" minDate={this.state.minDate} maxDate={this.state.maxDate} value={this.state.dateForData} onChange={this.updateDate} />
                                <HelpBlock>Player gauges will be fetched within a 7-day rolling window up to the date you pick up. </HelpBlock>
                            </Col>
                            <Col componentClass={ControlLabel} md={1}>Player</Col>
                            <Col md={2}>
                                <FormControl name="player" componentClass="select">

                                    {this.mapToOptions(this.state.playerList, 'player', 'player', 'player')}
                                </FormControl>
                                <HelpBlock>Select one player and submit to get the data. </HelpBlock>
                            </Col>
                            <Col md={3}>
                              <Button onClick={this.searchPlayerInfo}
                                block
                                className="btn-cardinal-orange">
                                Submit
                              </Button>
                            </Col>
                        </FormGroup>

                        <FormGroup>
                            <Col md={12}>{this.state.showNotice ? <p className="tip">{this.state.notice}</p> : null}</Col>
                        </FormGroup>
                    </Form>
                    <hr />
                    <Row>
                        <Col sm={12} md={3} lg={3} className="panel-img-col">
                            <CollapsiblePanel className="panel-center" collapsible={true} header={this.state.playerName}>
                                <Image className="player-panel-img panel-center" src={this.state.playerImage} />
                            </CollapsiblePanel>
                        </Col>
                        <Col sm={4} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="7 Day Average Mechanical Intensity"
                                rank={this.state.playerInfo.sevenDayAverageMechanicalIntensity}
                                total={this.state.playerInfo.sevenDayAverageMechanicalIntensityUpper}
                                color={this.state.playerInfo.sevenDayAverageMechanicalIntensityColor}/>
                            <RankCollapsiblePanel
                                header="7 Day Average PER"
                                rank={this.state.playerInfo.sevenDayAveragePER}
                                total={this.state.playerInfo.sevenDayAveragePERUpper}
                                color={this.state.playerInfo.sevenDayAveragePERColor} />
                        </Col>
                        <Col sm={4} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="7 Day Average Physio Load"
                                rank={this.state.playerInfo.sevenDayAveragePhysioLoad}
                                total={this.state.playerInfo.sevenDayAveragePhysioLoadUpper}
                                color={this.state.playerInfo.sevenDayAveragePhysioLoadColor}/>
                            <RankCollapsiblePanel
                                header="7 Day Average Accel 3 / Minute"
                                rank={this.state.playerInfo.sevenDayAverageAccel3PerMinute}
                                total={this.state.playerInfo.sevenDayAverageAccel3PerMinuteUpper}
                                color={this.state.playerInfo.sevenDayAverageAccel3PerMinuteColor} />
                        </Col>
                        <Col sm={4} md={3} lg={3}>
                            <RankCollapsiblePanel
                                header="14 day Acute Chronic Mechanical Intensity"
                                rank={this.state.playerInfo.fourteenDayAcuteChronicMechanicalIntensity}
                                total={3.00}
                                color={this.state.playerInfo.fourteenDayAcuteChronicMechanicalIntensityColor} />
                            <RankCollapsiblePanel
                                header="14 day Acute Chronic Physio Load"
                                rank={this.state.playerInfo.fourteenDayAcuteChronicPhysioLoad}
                                total={3.00}
                                color={this.state.playerInfo.fourteenDayAcuteChronicPhysioLoadColor} />
                        </Col>
                    </Row>
                    <Row>
                        <Col sm={12} md={12}>
                            <CollapsiblePanel collapsible={false} header="Key Performance Indicators">
                                <KpiTable
                                    csvFileName={this.state.playerName + "_player_summary.csv"}
                                    subTableFileName={this.state.playerName + "_quarter_level_player_summary.csv"}
                                    colNames={this.state.colNames}
                                    colorEncodedColNames={this.state.colorEncodedColNames}
                                    subTables={this.state.quarterData}
                                    exportData={this.state.summaryData}
                                    exportedQuarterData={this.state.exportedQuarterData}
                                    data={this.state.summaryData}/>
                                <p className="tip">Tip: Hold shift to multi-sort.</p>
                            </CollapsiblePanel>
                        </Col>
                    </Row>
                </div>
            </PageLoader>
        )
    }
}
