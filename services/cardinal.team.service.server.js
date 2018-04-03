module.exports = function(app, models) {

    const teamModel = models.teamModel;
    const userModel = models.userModel;

    const dateFormat = require('dateformat');
    const convert = require('json-2-csv');
    const colorMap = {'yellow': '#ffe884', 'green': '#a0bf7c', 'red': '#fe4365'};

    const teamMap = {
        ATL: 'Atlanta Hawks',
        BKN: 'Brooklyn Nets',
        BOS: 'Boston Celtics',
        CHA: 'Charlotte Hornets',
        CHI: 'Chicago Bulls',
        CLE: 'Cleveland Cavaliers',
        DAL: 'Dallas Mavericks',
        DEN: 'Denver Nuggets',
        DET: 'Detroit Pistons',
        GSW: 'Golden State Warriors',
        HOU: 'Houston Rockets',
        IND: 'Indiana Pacers',
        LAC: 'Los Angeles Clippers',
        LAL: 'Los Angeles Lakers',
        MEM: 'Memphis Grizzlies',
        MIA: 'Miami Heat',
        MIL: 'Milwaukee Bucks',
        MIN: 'Minnesota Timberwolves',
        NOP: 'New Orleans Pelicans',
        NYK: 'New York Knicks',
        OKC: 'Oklahoma City Thunder',
        ORL: 'Orlando Magic',
        PHI: 'Philadelphia 76ers',
        PHX: 'Phoenix Suns',
        POR: 'Portland Trail Blazers',
        SAC: 'Sacramento Kings',
        SAS: 'San Antonio Spurs',
        TOR: 'Toronto Raptors',
        UTA: 'Utah Jazz',
        WAS: 'Washington Wizards',
    };

    const dayMap = {1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday', 0: 'Sunday'};

    app.get("/api/user/:userId/team/:teamId", getTeamInfoByTeamId);
    app.get("/api/user/:userId/team/:teamId/check", checkTeamAccess);
    app.get("/api/user/:userId/team/:teamId/rank", getTeamRankByTeamId);
    app.get("/api/user/:userId/team/:teamId/train_report", getTrainReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/prediction_report", getPredictionReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/cardinal_report", getPerformanceReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/ngames_report", getNGamesReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/top_player_report", getTopPlayerReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/top_player_sum", getPlayerSumReportByTeamId);
    app.get("/api/user/:userId/team/:teamId/top_player_position", getPlayerPositionReportByTeamId);
    app.get("/api/user/:userId/top_player_league_wide", getTopPlayerLeagueReport);

    app.get("/api/user/:userId/team/:teamId/player", getPlayerListByTeamId);

    app.post('/api/admin/:adminId/user/:userId/team', addTeamAndUserId);

    app.delete('/api/admin/:adminId/user/:userId/team/:teamAbbr', deleteTeamAccess);

    const rollingWindowInDay = 30;

    function getPlayerPositionReportByTeamId(req, res) {

        let userType = parseInt(req.user.user_type);
        let userId = req.params.userId;
        let teamId = req.params.teamId;
        let position = req.query['position'];

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getPlayerPositionReportByTeamId(teamMap[teamId], userType, position)
                    .then(
                        modelRes => {
                            if (modelRes.rowCount) {
                                let playerReport = [];

                                if (userType === 1 || userType === -1) {
                                    playerReport = modelRes.rows.map(item => {
                                        return {
                                            'Player': item.player_name,
                                            'Team': item.team,
                                            'Last Game': dateFormat(item.last_game_played, "yyyy-mm-dd"),
                                            'Games Played': item.num_games_played,
                                            'Mechanical Load': item.mechanical_load,
                                            'Mechanical Load Rank': item.mechanical_load_rank,
                                            'Physio Load': item.physio_load,
                                            'Physio Load Rank': item.physio_load_rank,
                                            'Mechanical Int': item.mechanical_int,
                                            'Mechanical Int Rank': item.mechanical_int_rank,
                                            'Physio Int': item.physio_int,
                                            'Physio Int Rank': item.physio_int_rank,

                                        }});
                                }

                                if (userType === 2) {
                                    playerReport = modelRes.rows.map(item => {
                                        return {
                                            'Player': item.player_name,
                                            'Last Game': dateFormat(item.last_game_played, "yyyy-mm-dd"),
                                            'Games Played': item.num_games_played,
                                            'Mechanical Load': item.mechanical_load,
                                            'Physio Load': item.physio_load,
                                            'Mechanical Int': item.mechanical_int,
                                            'Physio Int': item.physio_int,

                                        }});
                                }


                                return res.json({
                                    status: true,
                                    playerReport: playerReport,
                                    colNames: Object.keys(playerReport[0])}).status(200);
                            } else {
                                return res.json({status: false, message: 'Top player report by position not found for ' + position}).status(404);
                            }
                        }
                    )
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3012. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => {response.send(e)}));

    }

    function getTopPlayerLeagueReport(req, res) {

        let userType = parseInt(req.user.user_type);

        if (userType === 1 || userType === -1) {
            teamModel
                .getTopPlayerLeagueReport()
                .then(
                    modelRes => {
                        if (modelRes.rowCount) {
                            let leagueReport = modelRes.rows.map(item => {
                                return {
                                    'Team': item.team,
                                    'Team Physio Load': item.team_pl,
                                    'Team Mechanical Load': item.team_ml,
                                    'Team Distance': item.team_distance,
                                    'Top 6 Physio Load': item.top6_pl,
                                    'Top 6 Mechanical Load': item.top6_ml,
                                    'Top 6 Distance': item.top6_distance,
                                    'Physio Load Percentage': item.perc_pl,
                                    'Mechanical Load Percentage': item.perc_ml,
                                    'Distance Percentage': item.perc_distance,
                                }});

                            return res.json({
                                status: true,
                                leagueReport: leagueReport,
                                colNames: Object.keys(leagueReport[0])}).status(200);
                        } else {
                            return res.json({status: false, message: 'Top player league wide report not found'}).status(404);
                        }
                    }
                )
        } else {
            return res.json({
                status: false,
                message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                .status(400);
        }
    }

    function getPlayerSumReportByTeamId(req, res) {

        let userId = req.params.userId;
        let teamId = req.params.teamId;

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getPlayerSumReportByTeamId(teamId)
                    .then(
                        modelRes => {
                            if (modelRes.rowCount) {
                                let playerSum = modelRes.rows.map(item => {
                                    return {
                                        'Player': item.player,
                                        'Minutes': item.minutes,
                                        'Physio Load': item.physio_load,
                                        'Mechanical Load': item.mechanical_load,
                                        'Distance': item.distance,
                                        'Minutes Rank': item.min_rank
                                    }});

                                return res.json({
                                    status: true,
                                    playerSum: playerSum,
                                    colNames: Object.keys(playerSum[0])}).status(200);
                            } else {
                                return res.json({status: false, message: 'Player sum report not found'}).status(404);
                            }
                        }
                    )
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3011. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => {response.send(e)}));

    }

    function getTopPlayerReportByTeamId(req, res) {
        let userId = req.params.userId;
        let teamId = req.params.teamId;

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getTopPlayerReportByTeamId(teamId)
                    .then(
                        modelRes => {
                            if (modelRes.rowCount) {
                                let item = modelRes.rows[0];
                                let topPlayerReport = {
                                        mins: item.perc_mins,
                                        phy_load: item.perc_pl,
                                        mech_load: item.perc_ml,
                                        dist: item.perc_distance,
                                    };

                                return res.json({
                                    status: true,
                                    playerReport: topPlayerReport}).status(200);
                            } else {
                                return res.json({status: false, message: 'Top-player percentage not found'}).status(404);
                            }
                        }
                    )
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3010. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => {response.send(e)}));


    }

    function getPerformanceReportByTeamId(req, res) {
        let userId = req.params.userId;
        let userType = parseInt(req.query['user_type']);
        let period = parseInt(req.query['period']);
        let teamId = req.params.teamId;

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getPerformanceReportByTeamId(teamId, userType, period)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let fields = Object.keys(modelRes.rows[0]);
                                let data = modelRes.rows;
                                convert.json2csv(
                                    data,
                                    function (err, csv) {
                                        if (err) {
                                            return res.json({status: false, message: 'error when exporting to csv'}).status(404);
                                        }
                                        if (period >= 0) {
                                            return res.json({
                                                status: true,
                                                cardinalPerformanceReportPer0: csv}).status(200);
                                        } else {
                                            return res.json({
                                                status: true,
                                                cardinalPerformanceReport: csv}).status(200);
                                        }
                                    });

                            } else {
                                return res.json({status: false, message: 'performance report not found'}).status(404);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3008. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { console.log('performance report'); console.log(e);}));
    }

    function deleteTeamAccess(request, response) {
        let userId = request.params.userId;
        let teamAbbr = request.params.teamAbbr;
        let adminId = request.params.adminId;

        (async () => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                teamModel
                    .removeTeamAccess(userId, teamAbbr)
                    .then(
                        modelRes => {
                            return response.json({ status: true, message: 'You successfully removed access from a user.'}).status(200)
                        }
                    )
                    .catch(
                        error => {
                            return response.json({ status: false, message: 'An error occurred while removing a teams access from a user.'}).status(400)
                        }
                    )
            }
        })().catch(e => setImmediate(() => {response.send(e)}));
    }

    function addTeamAndUserId(request, response) {
        let userId = request.params.userId;
        let team = request.body.data.team;
        let league = request.body.data.league;
        let teamAbbr = request.body.data.team_abbr;
        let adminId = request.params.adminId;

        (async () => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                teamModel
                    .findTeamByUserId(userId, teamAbbr)
                    .then(
                        modelRes => {
                            if(modelRes.rowCount === 0) {
                                teamModel
                                    .giveTeamAccessToUser(userId, team, league, teamAbbr)
                                    .then(
                                        (modelRes) => {
                                            return response.json({ status: true, message: 'You successfully added team access.'}).status(200);
                                        }
                                    )
                                    .catch(
                                        err => {
                                            return response.json({status: false, message: 'There was an error allowing team access.'}).status(400);
                                        }
                                    )
                            } else {
                                return response.json({status: false, message: 'User already has access to this team.'}).status(400);
                            }
                        }
                    )
                    .catch(
                        err => {
                            return response.json({status: false, message: 'There was an error allowing team access.'}).status(400);
                        }
                    )
            }
        })().catch(e => setImmediate(() => {response.send(e)}));
    }

    function mapZcoreToColor(z) {
        let res = -1;

        if (z && z > 1) {
            res = 1.0 / (1 + Math.exp(1-Number.parseFloat(z)));
        }

        return res;
    }
    
    function getNGamesReportByTeamId(req, res) {
        let userId = req.params.userId;
        let teamId = req.params.teamId;

        let start = req.query['start_date'];
        let end = req.query['end_date'];

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getNGamesReportByTeamId(teamId, start, end)
                    .then(
                        modelRes => {
                            if (modelRes.rowCount) {
                                let lastNReport = modelRes.rows.map(item => {
                                    return {
                                        Player: item.player,
                                        Games: item.games,
                                        Minutes: item.minutes,
                                        Distance: item.distance,
                                        'Physio Load': item.physio_load,
                                        'Physio Intensity': item.physio_intensity,
                                        'Mechanical Load': item.mechanical_load,
                                        'Mechanical Intensity': item.mechanical_int,
                                        'Off Mechanical Intensity': item.off_mechanical_int,
                                        'Def Mechanical Intensity': item.def_mechanical_int,
                                        'Accel3/Min': item.acc3min,
                                        'Ft/Min': item.ft_min,
                                        'Accels/Decels': item.accels_decels
                                }});

                                return res.json({
                                    status: true,
                                    lastNReport: lastNReport,
                                    colNames: Object.keys(lastNReport[0])}).status(200);
                            } else {
                                return res.json({status: false, message: 'N-games report not found'}).status(404);
                            }
                        }
                    )
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3009. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => {response.send(e)}));

    }

    function mapLocationToColor(loc) {
        let color = 'black';
        if (loc === 'Away') {
          color = colorMap.red;
        }

        return color;
    }

    function getOpponentList(raw) {
        let opponent = {};
        opponent[' '] = 'Opponent';
        for (let i = 0; i < raw.length; i++) {
            opponent[raw[i]["Game Date"]] = raw[i]["Opponent"];

        }
        let dates = Object.keys(opponent);

        for (let i = 0; i < raw.length; i++) {
            opponent[raw[i]["Game Date"] + ' Color'] = mapLocationToColor(raw[i]["Location"]);

        }

        return {opponentList: [opponent], colorEncodedColNames: dates};
    }

    function getPrediction(raw, kpi) {

        let prediction = [];
        let zscores = {};
        let i = 0;
        for (i = 0; i < raw.length; i++) {
            zscores[raw[i].Player] = {};
        }

        let date = '';
        for (i = 0; i < raw.length; i++) {
            date = raw[i]['Game Date'];
            zscores[raw[i].Player][date] = raw[i][kpi];
        }

        let kpis = {};
        let record = {};
        let player = null;
        for (player in zscores) {
            record['Player'] = player;
            kpis = zscores[player];
            for (date in kpis) {
                record[date] = kpis[date];
            }
            prediction.push(record);
            record = {};
        }


        let exportedPrediction = [];
        for (i = 0; i < prediction.length; i++) {
            record = prediction[i];
            let copy = Object.assign({}, record);
            exportedPrediction.push(copy);
            for (key in record) {
                if (key !== 'Player') {
                    record[key + ' Color'] = mapZcoreToColor(record[key]);
                }

            }

        }

        let cols = Object.keys(prediction[0]);

        return {
            cols: [cols[0]],
            cellColorEncodedColNames: cols.slice(1, Math.min(9, 1 + (cols.length - 1) / 2 )),
            data: prediction,
            exportedPrediction: exportedPrediction};
    }

    function getPredictionReportByTeamId(req, res) {
        let userId = req.params.userId;
        let teamId = req.params.teamId;

        let qdate = req.query['date'];
        let qdate_m = dateFormat(qdate, 'isoUtcDateTime');

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({
                    status: false,
                    message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '})
                    .status(400);
            } else {
                teamModel
                    .getPredictionReportByTeamId(teamId, qdate_m)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                // console.log(modelRes.rows);
                                let predictionReport = modelRes.rows.map(item => {
                                    return {
                                        Player: item.player,
                                        Team: item.team_abbr,
                                        Location: item.location,
                                        'Game Date': dateFormat(item.game_date, "yyyy-mm-dd"),
                                        'Weekday': dayMap[item.weekday],
                                        'Opponent': item.opponent_abbr,
                                        'Avg Physical Load': item.z_pl,
                                        'Avg Mechanical Load': item.z_ml,
                                        'Avg Mechanical Intensity': item.z_mi,
                                        'Avg Accel3/Min': item.z_acc3min
                                    }});

                                let a = getOpponentList(predictionReport);

                                return res.json({
                                    status: true,
                                    opponentList: a.opponentList,
                                    colorEncodedColNames: a.colorEncodedColNames,
                                    physicalLoad: getPrediction(predictionReport, 'Avg Physical Load'),
                                    mechLoad: getPrediction(predictionReport, 'Avg Mechanical Load'),
                                    mechIntensity: getPrediction(predictionReport, 'Avg Mechanical Intensity'),
                                    mechAccel: getPrediction(predictionReport, 'Avg Accel3/Min')}).status(200);
                            } else {
                                return res.json({status: false, message: 'prediction report not found'}).status(404);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer with error code 3007. '}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { console.log('prediction report'); console.log(e);}));
    }


    function getTrainReportByTeamId(req, res) {
        let userId = req.params.userId;
        let teamId = req.params.teamId;

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                teamModel
                    .getTrainReportByTeamId(teamId)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let trainReport = modelRes.rows.map(item => {
                                    return {
                                        Player: item.player,
                                        Team: item.team_abbr,
                                        'Training Program III': item.red_3_count,
                                        'Training Program II': item.red_2_count,
                                        'Training Program I': item.red_1_count,
                                        'Average': item.green_count,
                                        'Playoff Level': item.orange_1_count,
                                        'Playoff Level +': item.orange_2_count,
                                    }});
                                return res.json({status: true, trainReport: trainReport, trainColNames: Object.keys(trainReport[0])}).status(200);
                            } else {
                                return res.json({status: false, message: 'training report not found'}).status(404);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            return res.json({status: false, message: 'please contact developer: error code 3006'}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { console.log('train report'); console.log(e);}));
    }


    function getTeamRankByTeamId(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;

        if (teamId === 'SUM') return res.json({status: true, teamInfo: {
            totalDistance: 0,
            totalDistanceColor: colorMap['green'],
            totalPhysioLoad: 0,
            totalPhysioLoadColor: colorMap['green'],
            averageMechanicalIntensity: 0,
            averageMechanicalIntensityColor: colorMap['green']}}).status(200);

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                let qdate = req.query['date'];
                let qdate_m = dateFormat(qdate, 'isoUtcDateTime');
                teamModel
                    .getTeamRankByTeamId(teamId, qdate_m)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let row = modelRes.rows[0];
                                let teamInfo = {
                                    totalDistance: row.distance_rank,
                                    totalDistanceColor: colorMap[row.distance_color],
                                    totalPhysioLoad: row.physio_load_rank,
                                    totalPhysioLoadColor: colorMap[row.physio_load_color],
                                    averageMechanicalIntensity: row.mechanical_int_rank,
                                    averageMechanicalIntensityColor: colorMap[row.mechanical_int_color]};
                                return res.json({status: true, teamInfo: teamInfo}).status(200);
                            } else {
                                let teamInfo = {totalDistance: 0, totalPhysioLoad: 0, averageMechanicalIntensity: 0};
                                return res.json({status: false, message: 'team rank not found for ' + dateFormat(qdate, "isoUtcDateTime"), teamInfo: teamInfo}).status(404);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            console.log('team rank'); console.log(modelErr);
                            return res.json({status: false, message: 'please contact developer: error code 3005'}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { res.send(e) }));
    }

    function getPlayerListByTeamId(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;

        let season = req.query['season'];

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                teamModel
                    .getPlayerListByTeamId(teamId, season)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                return res.json({playerList: modelRes.rows}).status(200);
                            } else {
                                return res.json({status: false, message: 'player info not found'}).status(404);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            return res.json({status: false, message: 'please contact developer: error code 3001'}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { res.send(e) }));

    }

    function checkTeamAccess(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;
        teamModel
            .checkTeamAccess(userId, teamId)
            .then(
                (modelRes) => {
                    const access = (modelRes.rowCount > 0);
                    if (access) {
                        return res.json({access: true}).status(200);
                    } else {
                        return res.json({access: false, message: 'Data not available. Please contact Cardinal Advising staff for further access. '}).status(404);
                    }
                }
            )
            .catch(
                (err) => {return res.json({access: false, message: 'Please contact developer: error code 3003'}).status(400);}
            )
    }

    function compareDate(date1, date2) {
        return (date1.getFullYear() === date2.getFullYear()) && (date1.getMonth() === date2.getMonth()) && (date1.getDate() === date2.getDate())
    }

    function getTeamInfoByTeamId(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;
        let qdate = req.query['date'];
        let qdate_m = Date.parse(qdate);

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                let t = new Date(qdate_m);
                t.setDate(t.getDate() - rollingWindowInDay);
                let start = dateFormat(t, "isoUtcDateTime");
                let end = dateFormat(qdate, 'isoUtcDateTime');
                teamModel
                    .getTeamInfoByTeamId(teamId, end, start)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let row = modelRes.rows[0];
                                let summaryData = null;
                                let colNames = ['Player', 'Season', 'Minutes'];
                                let titleTeamName = row.team;
                                if (teamId === 'SUM') {
                                    titleTeamName = "League Summary";
                                    summaryData = modelRes.rows.map(item => {
                                        let redFlag = item.mechanical_int_gauge_color === 'red' || item.accel_3_min_gauge_color === 'red' || item.mechanical_int_acr_gauge_color === 'red';
                                        return {
                                            Player: item.player,
                                            Team: item.team,
                                            Season: item.season,
                                            Games: item.games,
                                            'Physio Load': item.physio_load,
                                            Minutes: item.minutes,
                                            'Feet/Min': item.ft_min,
                                            'Accel3/Min': item.accel_3_min,
                                            'Mechanical Intensity': item.mechanical_int,
                                            'Mechanical Intensity Color': item.mechanical_int_color,
                                            'Mechanical Load': item.mechanical_load,
                                            'Mechanical Load Color': item.mechanical_load_color,
                                            'Physio Load Color': item.physio_load_color,
                                            'Accel3/Min Color': item.accel_3_min_color,
                                            'Gauge Flag': redFlag ? 'red' : 'non-red',
                                            'Gauge Flag Color': redFlag ? 'red' : 'black'}});
                                    colNames = ['Player', 'Team', 'Season', 'Minutes'];
                                } else {
                                    summaryData = modelRes.rows.map(item => {
                                        let redFlag = item.mechanical_int_gauge_color === 'red' || item.accel_3_min_gauge_color === 'red' || item.mechanical_int_acr_gauge_color === 'red';
                                        return {
                                            Player: item.player,
                                            Season: item.season,
                                            Minutes: item.minutes,
                                            'Physio Load': item.physio_load,
                                            'Mechanical Load': item.mechanical_load,
                                            'Mechanical Intensity': item.mechanical_int,
                                            'Accel3/Min': item.accel_3_min,
                                            'Feet/Min': item.ft_min,
                                            'Mechanical Intensity Color': item.mechanical_int_color,
                                            'Mechanical Load Color': item.mechanical_load_color,
                                            'Physio Load Color': item.physio_load_color,
                                            'Accel3/Min Color': item.accel_3_min_color,
                                            'Gauge Flag': redFlag ? 'red' : 'non-red',
                                            'Gauge Flag Color': redFlag ? 'red' : 'black'}});
                                }

                                let colorEncodedColNames = ['Physio Load', 'Mechanical Load', 'Mechanical Intensity', 'Accel3/Min', 'Feet/Min', 'Gauge Flag'];
                                return res.json({
                                    status: true,
                                    teamName: titleTeamName,
                                    teamLogo: row.team_logo_loc,
                                    summaryData: summaryData,
                                    colorEncodedColNames: colorEncodedColNames,
                                    colNames: colNames}).status(200);
                            } else {
                                teamModel
                                    .getMostRecentTeamInfoByTeamId(teamId, end)
                                    .then(
                                        (recent) => {
                                            if (recent.rowCount) {
                                                let row = recent.rows[0];
                                                let date = row.game_date;
                                                let summaryData = [{
                                                        Player: null,
                                                        Games: null,
                                                        'Physio Load': null,
                                                        Minutes: null,
                                                        'Feet/Min': null,
                                                        'Accel3/Min': null,
                                                        'Mechanical Intensity': null,
                                                        'Mechanical Intensity Color': null,
                                                        'Physio Load Color': null,
                                                        'Accel3/Min Color': null}];
                                                return res.json({
                                                    status: true,
                                                    warning: true,
                                                    teamName: row.team,
                                                    teamLogo: row.team_logo_loc,
                                                    summaryData: summaryData,
                                                    message: 'No data for the team until ' + dateFormat(date, "isoUtcDateTime")}).status(200);
                                            } else {
                                                return res.json({status: false, message: 'No team info found. Try checking the date.'}).status(404);
                                            }
                                        }
                                    )
                                    .catch(
                                        (modelErr) => {
                                            return res.json({status: false, message: 'Please contact developer: error code 3003'}).status(400);
                                        }
                                    )

                            }

                        })
                    .catch(
                        (modelErr) => {
                            console.log('team info'); console.log(modelErr);
                            return res.json({status: false, message: 'Please contact developer: error code 3002'}).status(400);
                        });
            }
        })().catch(e => setImmediate(() => { res.send(e) }));
    }
};
