import React, { Component } from 'react';
import {Col, Row, Form, FormGroup, FormControl, Alert, ControlLabel, HelpBlock, Button, Glyphicon, Checkbox} from 'react-bootstrap';
import axios from 'axios';
import moment from 'moment';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import LineChart from './lineChart.jsx';
import {Util} from './util.jsx';


export default class LineChartTool extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            showLoader: false,
            showAlert: false,
            alertStyle: 'info',
            startDate: moment(new Date()).subtract(30, 'days'),
            endDate: moment(new Date()),
            playerList: [],
            playerId: ['', ''],
            playerImage: ['', ''],
            message: '',
            teamId: '',
            showChart: false,
            dataType: ['Accel3/Min', 'Accel3/Min'],
            summaryData: [[{}], [{}]],
            trend: [false, false],
            gradient: [false, false],
            intercept: [false, false],
            showSecondPlayer: false,
            base: [1, 1],
            sdLine: [false, false],
            stats: [{}, {}],
        };

        this.closeAlert = this.closeAlert.bind(this);
        this.getPlayerListByTeamId = this.getPlayerListByTeamId.bind(this);
        this.handleApply = this.handleApply.bind(this);
        this.searchPlayerInfo = this.searchPlayerInfo.bind(this);
        this.addPlayer = this.addPlayer.bind(this);
        this.removePlayer = this.removePlayer.bind(this);
        this.fitTrend = this.fitTrend.bind(this);
        this.getStats = this.getStats.bind(this);
        this.changeStd0 =  this.changeStd0.bind(this);
        this.changeStd1 =  this.changeStd1.bind(this);
        this.changeTrend0 =  this.changeTrend0.bind(this);
        this.changeTrend1 =  this.changeTrend1.bind(this);
    }

    getStats(player_index) {
        let dataType = document.forms[0]['data' + player_index].value;
        let dataset = this.state.summaryData[player_index].map(d => {return {data: d[dataType]}});

        axios.get("/api/analysis/stats", {params: {data: dataset}})
            .then((res) => {
                let stats_copy = this.state.stats;
                stats_copy[player_index] = res.data.stats;
                if (res.data.status) {
                    this.setState({stats: stats_copy});
                } else {
                    this.setState({showAlert: true, alertStyle: 'warning', message: res.data.message, stats: stats_copy});
                }
            })
            .catch(e => {console.log(e)});
    }

    addPlayer() {
        this.setState({showSecondPlayer: true});
    }

    removePlayer() {
        const player_index = 1;
        let gradient_copy = this.state.gradient;
        gradient_copy[player_index] = false;

        let intercept_copy = this.state.intercept;
        intercept_copy[player_index] = false;

        let base_copy = this.state.base;
        base_copy[player_index] = false;

        let trend_copy = this.state.trend;
        trend_copy[player_index] = false;

        let sdLine_copy = this.state.sdLine;
        sdLine_copy[player_index] = false;

        let playerId_copy = this.state.playerId;
        playerId_copy[player_index] = '';

        let dataType_copy = this.state.dataType;
        dataType_copy[player_index] = 'Accel3/Min';

        let img_copy = this.state.playerImage;
        img_copy[player_index] = '';

        let stats_copy = this.state.stats;
        stats_copy[player_index] = {};

        let summaryData_copy = this.state.summaryData;
        summaryData_copy[player_index] = [{}];

        this.setState({
            gradient: gradient_copy,
            intercept: intercept_copy,
            base: base_copy,
            trend: trend_copy,
            playerId: playerId_copy,
            dataType: dataType_copy,
            playerImage: img_copy,
            summaryData: summaryData_copy,
            sdLine: sdLine_copy,
            showSecondPlayer: false});
    }

    displayLoader(timeDelay) {
        this.setState({showLoader: true});
        setTimeout(() => {
            this.setState({showLoader: false});
        }, timeDelay);
    }

    fitTrend(player_index) {
        // let fitFlag = document.forms[0]['trend' + player_index].checked;
        // let fitFlag = this.state.trend[player_index];
        // if (fitFlag) {
            let dataType = document.forms[0]['data' + player_index].value;
            let dataset = this.state.summaryData[player_index].map(d => {return {date: d["Game Date"], kpi: d[dataType]}});
            let X = "Game Date";
            axios.get(`/api/analysis/linear_regression`, {params: {X: X, y: dataType, dataset: dataset}})
                .then(
                    (res) => {
                        if (res.data.status) {
                            let gradient_copy = this.state.gradient;
                            gradient_copy[player_index] = res.data.gradient;

                            let intercept_copy = this.state.intercept;
                            intercept_copy[player_index] = res.data.intercept;

                            let base_copy = this.state.base;
                            base_copy[player_index] = res.data.base;

                            // let trend_copy = this.state.trend;
                            // trend_copy[player_index] = true;

                            this.setState({gradient: gradient_copy, intercept: intercept_copy, base: base_copy});
                        } else {
                            this.setState({showAlert: true, alertStyle: 'warning', message: res.data.message});
                        }
                    }
                )
                .catch(e => {console.log(e)});
        // }
        // else {
        //     let trend_copy = this.state.trend;
        //     trend_copy[player_index] = false;
        //
        //     this.setState({trend: trend_copy});
        // }

    }

    callPlayerInfoService(player_index) {

        let player = document.forms[0]['player' + player_index].value;
        let dataType = document.forms[0]['data' + player_index].value;

        let userId = this.state.userId;
        let teamId = this.props.match.params.teamId;
        let start = this.state.startDate.format('YYYY-MM-DD'), end = this.state.endDate.format('YYYY-MM-DD');

        axios.get(`/api/user/${userId}/team/${teamId}/player/${player}?start_date=${start}&end_date=${end}`)
            .then(
                (res) => {
                    if (res.data.status) {
                        if (res.data.message) {
                            this.setState({showAlert: true, alertStyle: 'warning', message: res.data.message});
                        }
                        let playerId_copy = this.state.playerId;
                        playerId_copy[player_index] = player;

                        let dataType_copy = this.state.dataType;
                        dataType_copy[player_index] = dataType;

                        let img_copy = this.state.playerImage;
                        img_copy[player_index] = res.data.playerImage;

                        let summaryData_copy = this.state.summaryData;
                        summaryData_copy[player_index] = res.data.summaryData;

                        this.setState(
                            {
                                playerId: playerId_copy,
                                playerImage: img_copy,
                                dataType: dataType_copy,
                                summaryData: summaryData_copy,
                                showChart: true
                            }, () => {
                                this.fitTrend(player_index);
                                this.getStats(player_index);});


                    } else {
                        this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                    }
                })
            .catch((err) => {console.log(err)});
    }

    searchPlayerInfo() {

        this.callPlayerInfoService(0);

        if (this.state.showSecondPlayer) {
            this.callPlayerInfoService(1);
        }

        this.displayLoader(4000);

    }


    handleApply(event, picker) {
        this.setState({
            startDate: picker.startDate,
            endDate: picker.endDate
        });
    }

    closeAlert() {
        this.setState({showAlert: false});
    }

    componentWillMount() {
        let teamId = this.props.match.params.teamId;

        (async () => {
            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id, teamId: teamId},
                    this.getPlayerListByTeamId(data.user_id, teamId, '2017-18', true));
            } else {
                this.props.history.replace({pathname: '/login'});
            }
        })().catch(e => console.log(e));

    }

    mapToOptions(list, valueKey, contentKey) {
        return list.map((item, i) => {
            return  <option key={i} value={item[valueKey]}>{item[contentKey]}</option>;
        });
    }


    getPlayerListByTeamId(userId, teamId, season, ins_flag) {
        let playerList = [];

        axios.get(`/api/user/${userId}/team/${teamId}/player`, {params: {season: season}})
            .then((res) => {
                playerList = res.data.playerList;
                this.setState({playerList: playerList},
                    () => {
                        if (ins_flag) {
                            this.searchPlayerInfo();
                        }
                    });
            })
            .catch((error) => {
                console.log(error);
            });

    }

    changeStd0() {
        let sdLine_copy = this.state.sdLine;
        sdLine_copy[0] = !sdLine_copy[0];
        this.setState({sdLine: sdLine_copy});
    }

    changeStd1() {
        let sdLine_copy = this.state.sdLine;
        sdLine_copy[1] = !sdLine_copy[1];
        this.setState({sdLine: sdLine_copy});
    }

    changeTrend0() {
        let trend_copy = this.state.trend;
        trend_copy[0] = !trend_copy[0];
        this.setState({trend: trend_copy});
    }

    changeTrend1() {
        let trend_copy = this.state.trend;
        trend_copy[1] = !trend_copy[1];
        this.setState({trend: trend_copy});
    }

    render() {
        let start = this.state.startDate.format('MM/DD/YYYY');
        let end = this.state.endDate.format('MM/DD/YYYY');
        let label = start + ' - ' + end;
        if (start === end) {
            label = start;
        }

        const dataOptions = [
            {data: 'Accel3/Min'},
            {data: 'Defensive Mechanical Intensity'},
            {data: 'Mechanical Intensity'},
            {data: 'Mechanical Load'},
            {data: 'Minutes'},
            {data: 'Offensive Mechanical Intensity'},
            {data: 'PER'},
            {data: 'Physio Load'}, {data: 'Feet/Min'}];


        return (
            <PageLoader show={this.state.showLoader} ref='visualAnalysisCenter' className='visualAnalysisCenter'>
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

                    <Form horizontal>
                        <FormGroup>
                            <Row>
                                <Col componentClass={ControlLabel} md={1}>By Date</Col>
                                <Col md={7}>
                                    <DatetimeRangePicker startDate={this.state.startDate} endDate={this.state.endDate} onApply={this.handleApply} opens='center'>
                                        <div className="input-group">
                                            <input type="text" className="form-control" placeholder={label}/>
                                            <span className="input-group-btn">
                                        <Button className="default date-range-toggle">
                                            <i className="fa fa-calendar"/>
                                        </Button>
                                    </span>
                                        </div>
                                    </DatetimeRangePicker>
                                    <HelpBlock>Select the dates you would like to analyze. </HelpBlock>
                                </Col>
                                <Col md={3}> </Col>
                                <Col componentClass={ControlLabel} md={1}>
                                    {this.state.showSecondPlayer ? <Glyphicon glyph="minus" onClick={this.removePlayer}/> : <Glyphicon glyph="plus" onClick={this.addPlayer}/>}
                                    </Col>
                            </Row>

                            <Row>
                                <Col componentClass={ControlLabel} md={1}>Player</Col>
                                <Col md={3}>
                                    <FormControl name="player0" componentClass="select">
                                        { this.mapToOptions(this.state.playerList, 'player', 'player') }
                                    </FormControl>
                                    <HelpBlock>Select one player and submit to get the data. </HelpBlock>
                                </Col>
                                <Col componentClass={ControlLabel} md={1}>Data</Col>
                                <Col md={3}>
                                    <FormControl name="data0" componentClass="select">
                                        { this.mapToOptions(dataOptions, 'data', 'data') }
                                    </FormControl>
                                    <HelpBlock>Select the KPI you would like to receive. </HelpBlock>
                                </Col>

                                <Col componentClass={ControlLabel} md={1}>
                                    Trend
                                </Col>
                                <Col md={1}>
                                    <Checkbox name="trend0" onChange={this.changeTrend0}></Checkbox>
                                    <HelpBlock>Trend line. </HelpBlock>
                                </Col>

                                <Col componentClass={ControlLabel} md={1}>
                                    Std
                                </Col>
                                <Col md={1}>
                                    <Checkbox name="std0" onChange={this.changeStd0}></Checkbox>
                                    <HelpBlock>Standard Deviation. </HelpBlock>
                                </Col>
                            </Row>

                                {this.state.showSecondPlayer ?
                                    <div>
                                        <Row>
                                            <Col componentClass={ControlLabel} md={1}>Player</Col>
                                            <Col md={3}>
                                                <FormControl name="player1" componentClass="select">
                                                    { this.mapToOptions(this.state.playerList, 'player', 'player') }
                                                </FormControl>
                                                <HelpBlock>Select the second player. </HelpBlock>
                                            </Col>
                                            <Col componentClass={ControlLabel} md={1}>Data</Col>
                                            <Col md={3}>
                                                <FormControl name="data1" componentClass="select">
                                                    { this.mapToOptions(dataOptions, 'data', 'data') }
                                                </FormControl>
                                            </Col>
                                            <Col componentClass={ControlLabel} md={1}>
                                                Trend
                                            </Col>
                                            <Col md={1}>
                                                <Checkbox name="trend1" onChange={this.changeTrend1}></Checkbox>
                                                <HelpBlock>Trend line. </HelpBlock>
                                            </Col>

                                            <Col componentClass={ControlLabel} md={1}>
                                                Std
                                            </Col>
                                            <Col md={1}>
                                                <Checkbox name="std1" onChange={this.changeStd1}></Checkbox>
                                                <HelpBlock>Standard Deviation. </HelpBlock>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col md={10}> </Col>
                                            <Col md={2}>
                                                <Button onClick={this.searchPlayerInfo} block className="btn-cardinal-orange">Submit</Button>
                                            </Col>
                                        </Row>
                                    </div>
                                     :
                                    <Row>
                                        <Col md={10}> </Col>
                                        <Col md={2}>
                                            <Button onClick={this.searchPlayerInfo} block className="btn-cardinal-orange">Submit</Button>
                                        </Col>
                                    </Row>
                                }




                        </FormGroup>

                    </Form>

                    <hr/>

                    {this.state.showChart ?
                        <LineChart
                            dataType={this.state.dataType}
                            players={this.state.playerId}
                            images={this.state.playerImage}
                            trends={this.state.trend}
                            bases={this.state.base}
                            gradients={this.state.gradient}
                            intercepts={this.state.intercept}
                            stats={this.state.stats}
                            sdLines={this.state.sdLine}
                            showSecondPlayer={this.state.showSecondPlayer}
                            data={this.state.summaryData}/> : null}

                </div>
            </PageLoader>

        )
    }
}