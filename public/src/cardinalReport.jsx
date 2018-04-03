import React from 'react';
import {Alert, Link} from 'react-bootstrap';
import axios from 'axios';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';

export default class CardinalReport extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            showLoader: false,
            userId: '',
            cardinalPerformanceReport: '',
            cardinalPerformanceReportPer0: '',
            showAlert: false,
            alertStyle: 'info',
            message: ''
        };

        this.closeAlert = this.closeAlert.bind(this);
        this.getCardinalCSV = this.getCardinalCSV.bind(this);
        this.getCardinalPeriodCSV = this.getCardinalPeriodCSV.bind(this);

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

    getCardinalReport(userId, userType, teamId, period) {
        axios.get('/api/user/' + userId + '/team/' + teamId + '/cardinal_report', {params: {user_type: userType, period: period}})
            .then((res) => {
                if (res.data.status) {

                    if (period >= 0) {
                        this.setState({cardinalPerformanceReportPer0: res.data.cardinalPerformanceReportPer0});
                    } else {
                        this.setState({cardinalPerformanceReport: res.data.cardinalPerformanceReport});
                    }
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
                        this.getCardinalReport(data.user_id, data.user_type, teamId, -1);
                        this.getCardinalReport(data.user_id, data.user_type, teamId, 0);
                    });
            } else {
                this.props.history.replace({pathname: '/login'});
            }

        })().catch(e => console.log(e));

        this.displayLoader(8000);

    }

    getCardinalCSV() {
        let blobdata = new Blob([this.state.cardinalPerformanceReport],{type : 'text/csv'});
        let link = document.createElement("a");
        link.setAttribute("href", window.URL.createObjectURL(blobdata));
        link.setAttribute("download", "cardinal_performance.csv");
        link.style = "visibility:hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    getCardinalPeriodCSV() {
        let blobdata = new Blob([this.state.cardinalPerformanceReportPer0],{type : 'text/csv'});
        let link = document.createElement("a");
        link.setAttribute("href", window.URL.createObjectURL(blobdata));
        link.setAttribute("download", "cardinal_performance_per0.csv");
        link.style = "visibility:hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                    <h1>Cardinal Performance Summary</h1>
                    <hr />

                    <p className="tip">Click and download. </p>

                    <a className="btn btn-cardinal-orange margin-right-7px" onClick={this.getCardinalCSV} download={'cardinal_performance.csv'}>Cardinal Performance</a>
                    <a className="btn btn-cardinal-orange margin-right-7px" onClick={this.getCardinalPeriodCSV} download={'cardinal_performance_per0.csv'}>Cardinal Performance Per 0</a>
                </div>
            </PageLoader>
        )
    }




}