import React, { Component } from 'react';
import {Panel, Col, Image, Row, Link} from 'react-bootstrap';
import axios from 'axios';
import NavBar from './navbar.jsx';
import navBarBrand from './navbarBrand.jsx';
import PageLoader from './pageLoader.jsx';
import {Util} from './util.jsx';
import { IndexLinkContainer } from 'react-router-bootstrap';

export default class VisualizationCenter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userId: '',
            showLoader: false,
        };
    }

    displayLoader(timeDelay) {
        this.setState({showLoader: true});
        setTimeout(() => {
            this.setState({showLoader: false});
        }, timeDelay);
    }

    componentWillMount() {
        let teamId = this.props.match.params.teamId;

        (async () => {
            const { data } = await axios.get('/api/logged_in');
            if (data.status) {
                this.setState({userId: data.user_id});
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
                    <h1>Visualization Center</h1>
                    <hr />
                    <Row>
                        <Col sm={4} md={4}>
                            <IndexLinkContainer to={'/team/' + this.props.match.params.teamId + '/visualization/line_chart'}>
                                <Panel className="visualization-module">
                                    <Image className="panel-center visualization-module-graph" src={'/img/line_chart.png'}/>
                                    <p className="text-center visualization-module-name">Line Chart</p>
                                </Panel>
                            </IndexLinkContainer>
                        </Col>
                    </Row>
                </div>
            </PageLoader>

        )

    }

}