import React from 'react';
import {Alert, Form, FormGroup, Col, Button, ControlLabel, HelpBlock} from 'react-bootstrap';
import axios from 'axios';
import NavBar from './navbar.jsx';
import KpiTable from './kpiTable.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import moment from 'moment';
import DatetimeRangePicker from 'react-bootstrap-datetimerangepicker';
import {Util} from './util.jsx';


export default class LastNReport extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showLoader: false,
            userId: '',
            lastNColNames: [],
            lastNReport: [{}],
            startDate: moment(new Date()).subtract(7, 'days'),
            endDate: moment(new Date()),
            showAlert: false,
            alertStyle: 'info',
            message: ''
        };

        this.getLastNReport = this.getLastNReport.bind(this);
        this.searchLastNReport = this.searchLastNReport.bind(this);
        this.closeAlert = this.closeAlert.bind(this);
        this.handleApply = this.handleApply.bind(this);
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

    handleApply(event, picker) {

        this.setState({
            startDate: picker.startDate,
            endDate: picker.endDate
        });
    }

    searchLastNReport() {

        this.getLastNReport(
            this.state.userId,
            this.props.match.params.teamId,
            this.state.startDate.format('YYYY-MM-DD'),
            this.state.endDate.format('YYYY-MM-DD'));
    }

    getLastNReport(userId, teamId, start, end) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/ngames_report',
            {params: {start_date: start, end_date: end}})
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({lastNReport: res.data.lastNReport, colNames: res.data.colNames});
                } else {
                    this.setState({showAlert: true, alertStyle: 'danger', message: res.data.message});
                }
            })
            .catch((error) => {
                console.log(error);
            });

        this.displayLoader(2000);
    }

    componentWillMount () {
        let teamId = this.props.match.params.teamId;

        let start = this.state.startDate.format('YYYY-MM-DD');
        let end = this.state.endDate.format('YYYY-MM-DD');

        (async () => {

            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id}, this.getLastNReport(data.user_id, teamId, start, end));
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(1800);
    }

    render() {
        let start = this.state.startDate.format('MM/DD/YYYY');
        let end = this.state.endDate.format('MM/DD/YYYY');
        let label = start + ' - ' + end;
        if (start === end) {
            label = start;
        }

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
                    <h1>N-games Report</h1>
                    <hr />

                    <Form horizontal>
                        <FormGroup>
                            <Col componentClass={ControlLabel} md={1}>By Date</Col>
                            <Col md={4}>
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

                            <Col md={2}>
                                <Button onClick={this.searchLastNReport} block className="btn-cardinal-orange">Submit</Button>
                            </Col>
                        </FormGroup>
                    </Form>

                    <KpiTable
                        csvFileName={this.props.match.params.teamId + "_lastN_report.csv"}
                        colNames={this.state.colNames}
                        colorEncodedColNames={[]}
                        data={this.state.lastNReport} />
                    <p className="tip">Tip: Hold shift to multi-sort.</p>

                </div>
            </PageLoader>
        )
    }




}