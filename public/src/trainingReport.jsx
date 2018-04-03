import React from 'react';
import {Alert} from 'react-bootstrap';
import axios from 'axios';
import NavBar from './navbar.jsx';
import KpiTable from './kpiTable.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';

export default class TrainingReport extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showLoader: false,
            userId: '',
            trainColNames: [],
            trainReport: [{}],
            showAlert: false,
            alertStyle: 'info',
            message: ''
        };

        this.getTrainReport = this.getTrainReport.bind(this);
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

    getTrainReport(userId, teamId) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/train_report')
            .then((res) => {
                let status = res.data.status;
                if (status) {
                    this.setState({trainReport: res.data.trainReport, trainColNames: res.data.trainColNames});
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
                        this.getTrainReport(data.user_id, teamId)
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
                    <h1>Training Report</h1>
                    <hr />

                            <KpiTable
                            csvFileName={this.props.match.params.teamId + "_training_report.csv"}
                            colNames={this.state.trainColNames}
                            colorEncodedColNames={[]}
                            data={this.state.trainReport} />
                            <p className="tip">Tip: Hold shift to multi-sort.</p>

                </div>
            </PageLoader>
        )
    }




}