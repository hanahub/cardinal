import React from 'react';
import { HashRouter, Route, withRouter } from 'react-router-dom';

import TeamDashBoard from './teamDashBoard.jsx';
import PlayerDashBoard from './playerDashBoard.jsx';
import homepage from './homepage.jsx';
import LoginPanel from './login.jsx';
import RegisterPanel from './register.jsx';
import ProfilePanel from './profile.jsx';
import TrainingReport from './trainingReport.jsx';
import PredictionReport from './predictionReport.jsx';
import LastNReport from './lastNReport.jsx';
import TopPlayerReport from './top6PlayerReport.jsx';
import TopPlayerPositionReport from './top10PlayerPositionReport.jsx';
import CardinalReport from './cardinalReport.jsx';
import VisualizationCenter from './visualizationCenter.jsx';
import LineChartTool from './lineChartTool.jsx';



const appRoutes = (
    <HashRouter>
        <div>
            <Route exact={true} path="/" component={homepage} />
            <Route exact={true} path="/login" component={LoginPanel} />
            <Route exact={true} path="/register" component={RegisterPanel} />
            <Route exact={true} path="/profile" component={withRouter(ProfilePanel)} />
            <Route exact={true} path="/team/:teamId" component={withRouter(TeamDashBoard)} />
            <Route exact={true} path="/team/:teamId/player" component={withRouter(PlayerDashBoard)} />
            <Route exact={true} path="/team/:teamId/training_report" component={withRouter(TrainingReport)} />
            <Route exact={true} path="/team/:teamId/prediction_report" component={withRouter(PredictionReport)} />
            <Route exact={true} path="/team/:teamId/cardinal_report" component={withRouter(CardinalReport)} />
            <Route exact={true} path="/team/:teamId/ngames_report" component={withRouter(LastNReport)} />
            <Route exact={true} path="/team/:teamId/top_player_report" component={withRouter(TopPlayerReport)} />
            <Route exact={true} path="/team/:teamId/top_player_position" component={withRouter(TopPlayerPositionReport)} />
            <Route exact={true} path='/team/:teamId/visualization' component={withRouter(VisualizationCenter)} />
            <Route exact={true} path='/team/:teamId/visualization/line_chart' component={withRouter(LineChartTool)} />
        </div>
    </HashRouter>
);

export default appRoutes;
