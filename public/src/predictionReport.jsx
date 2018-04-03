import React from 'react';
import {Alert, Table, Form, Col, HelpBlock, FormGroup, ControlLabel} from 'react-bootstrap';
import axios from 'axios';
import DatePicker from 'react-bootstrap-date-picker';
import NavBar from './navbar.jsx';
import KpiTable from './kpiTable.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';

const locationColorMap = {'Home': 'black', 'Away': 'red'};

function getLocationColor(colorKey) {
    if (!colorKey) return 'black';
    return locationColorMap[colorKey];
}

export default class PredictionReport extends React.Component {
    constructor (props) {
        super(props);
        const init_prediction = {cols: [], data: []};

        let d = new Date();

        this.state = {
            showLoader: false,
            userId: '',
            physicalLoad: init_prediction,
            mechLoad: init_prediction,
            mechIntensity: init_prediction,
            mechAccel: init_prediction,
            opponentList: [{}],
            colorEncodedColNames: [],
            showAlert: false,
            alertStyle: 'info',
            message: '',
            dateForData: d.toISOString()
        };

        this.getPredictionReport = this.getPredictionReport.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.mapToOpponentCol = this.mapToOpponentCol.bind(this);
        this.getReportByDate = this.getReportByDate.bind(this);
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

    getPredictionReport(userId, teamId, date) {

        axios.get('/api/user/' + userId + '/team/' + teamId + '/prediction_report', {
            params: {
                date: date
            }
        })
            .then((res) => {
                let status = res.data.status;
                if (status) {

                    this.setState({
                        physicalLoad: res.data.physicalLoad,
                        mechLoad: res.data.mechLoad,
                        mechIntensity: res.data.mechIntensity,
                        mechAccel: res.data.mechAccel,
                        opponentList: res.data.opponentList, colorEncodedColNames:
                        res.data.colorEncodedColNames});
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
                this.setState({userId: data.user_id},
                    () => {
                        this.getPredictionReport(data.user_id, teamId, this.state.dateForData)
                    });
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(2500);


    }


    mapToOpponentCol(key, colorKey) {
        return this.state.opponentList.map((x, i) =>
            (<td key={i} style={{'color': getLocationColor(x[colorKey])}}>{x[key]}</td>)
        );
    }

    getReportByDate(date) {
        if (date) {
            date = (new Date(date)).toISOString();
            let teamId = this.props.match.params.teamId;
            this.getPredictionReport(this.state.userId, teamId, date);
            this.displayLoader(2500);
            this.setState({dateForData: date});
        }
    }

    render() {

        const opponentTable = (
            <KpiTable
                csvFileName={this.props.match.params.teamId + "_opponents.csv"}
                colNames={[]}
                colorEncodedColNames={this.state.colorEncodedColNames}
                showPagination={false}
                defaultPageSize={1}
                data={this.state.opponentList} />
        );

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
                    <h1>Prediction Report</h1>
                    <hr />
                    <Form horizontal>
                        <FormGroup>
                            <Col componentClass={ControlLabel} md={1}>By Date</Col>
                            <Col md={5}>
                                <DatePicker value={this.state.dateForData} onChange={this.getReportByDate}/>

                                <HelpBlock>select a date and look forward 7 days</HelpBlock>
                            </Col>

                        </FormGroup>
                    </Form>

                    <h3>Physical Load Projected - Z-scores</h3>
                    <hr />
                    {opponentTable}
                    <HelpBlock>Red for Away, Black for Home</HelpBlock>
                        <KpiTable
                        csvFileName={this.props.match.params.teamId + "_physical_load_projected.csv"}
                        colNames={this.state.physicalLoad.cols}
                        colorEncodedColNames={[]}
                        cellColorEncodedColNames={this.state.physicalLoad.cellColorEncodedColNames}
                        defaultPageSize={7}
                        exportData={this.state.physicalLoad.exportedPrediction}
                        data={this.state.physicalLoad.data} />
                        <p className="tip">Tip: Hold shift to multi-sort.</p>


                    <h3>Mechanical Load Projected - Z-scores</h3>
                    <hr />
                    {opponentTable}
                    <HelpBlock>Red for Away, Black for Home</HelpBlock>
                            <KpiTable
                                csvFileName={this.props.match.params.teamId + "_mechanical_load_projected.csv"}
                                colNames={this.state.mechLoad.cols}
                                colorEncodedColNames={[]}
                                cellColorEncodedColNames={this.state.mechLoad.cellColorEncodedColNames}
                                defaultPageSize={7}
                                exportData={this.state.mechLoad.exportedPrediction}
                                data={this.state.mechLoad.data} />
                            <p className="tip">Tip: Hold shift to multi-sort.</p>


                    <h3>Mechanical Intensity Projected - Z-scores</h3>
                    <hr />
                    {opponentTable}
                    <HelpBlock>Red for Away, Black for Home</HelpBlock>
                            <KpiTable
                                csvFileName={this.props.match.params.teamId + "_mechanical_int_projected.csv"}
                                colNames={this.state.mechIntensity.cols}
                                colorEncodedColNames={[]}
                                cellColorEncodedColNames={this.state.mechIntensity.cellColorEncodedColNames}
                                defaultPageSize={7}
                                exportData={this.state.mechIntensity.exportedPrediction}
                                data={this.state.mechIntensity.data} />
                            <p className="tip">Tip: Hold shift to multi-sort.</p>


                    <h3>Accel. 3/Min Projected - Z-scores</h3>
                    <hr />
                    {opponentTable}
                    <HelpBlock>Red for Away, Black for Home</HelpBlock>
                            <KpiTable
                                csvFileName={this.props.match.params.teamId + "_accel_projected.csv"}
                                colNames={this.state.mechAccel.cols}
                                colorEncodedColNames={[]}
                                cellColorEncodedColNames={this.state.mechAccel.cellColorEncodedColNames}
                                defaultPageSize={7}
                                exportData={this.state.mechAccel.exportedPrediction}
                                data={this.state.mechAccel.data} />
                            <p className="tip">Tip: Hold shift to multi-sort.</p>

                </div>
            </PageLoader>
        )
    }




}