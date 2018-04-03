module.exports = function(app, models) {

    const playerModel = models.playerModel;
    const teamModel = models.teamModel;
    const colorMap = {'orange': '#F4783B', 'green': '#a0bf7c', 'red': '#fe4365', 'blue': '#3b59f4'};

    const dateFormat = require('dateformat');
    const rollingWindowInDay = 7;

    app.get("/api/season", getSeason);
    app.get("/api/user/:userId/team/:teamId/player/:playerId/gauge", getGaugesByPlayerId);
    app.get("/api/user/:userId/team/:teamId/player/:playerId", getPlayerInfoByPlayerId);
    app.get("/api/user/:userId/team/:teamId/player/:playerId/quarter", getQuarterDataByPlayerId);


    function getQuarterDataByPlayerId(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;
        let end_date = req.query['end_date'];
        let start_date = req.query['start_date'];

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                let playerId = req.params.playerId;
                let start = dateFormat(start_date, 'isoUtcDateTime');
                let end = dateFormat(end_date, 'isoUtcDateTime');

                playerModel
                    .getQuarterDataByPlayerId(playerId, teamId, start, end)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let item = null, record = null;
                                let quarterData = {};
                                let exportedQuarterData = [];

                                for (let i = 0; i < modelRes.rowCount; i++) {
                                    item = modelRes.rows[i];
                                    record = dateFormat(item['game_date'], "yyyy-mm-dd");
                                    quarterData[record] = [];
                                    exportedQuarterData.push(
                                        {
                                            'Game Date': record,
                                            Period: item.period,
                                            Location: item.home_away,
                                            Opponent: item.opponent,
                                            Result: item.win_loss,
                                            Minutes: item.minutes,
                                            'Physio Load': item.physio_load,
                                            'Mechanical Load': item.mechanical_load,
                                            'Mechanical Intensity': item.mechanical_int,
                                            'Defensive Mechanical Intensity': item.def_mechanical_int,
                                            'Offensive Mechanical Intensity': item.off_mechanical_int,
                                            'Accel3/Min': item.accel_3_min,
                                            'Feet/Min': item.ft_min,
                                            PER: item.hollingerper
                                        }
                                    );
                                }

                                for (let i = 0; i < modelRes.rowCount; i++) {
                                    item = modelRes.rows[i];
                                    record = {
                                        Period: item.period,
                                        Location: item.home_away,
                                        Opponent: item.opponent,
                                        Result: item.win_loss,
                                        Minutes: item.minutes,
                                        'Physio Load': item.physio_load,
                                        'Mechanical Load': item.mechanical_load,
                                        'Mechanical Intensity': item.mechanical_int,
                                        'Defensive Mechanical Intensity': item.def_mechanical_int,
                                        'Offensive Mechanical Intensity': item.off_mechanical_int,
                                        'Accel3/Min': item.accel_3_min,
                                        'Feet/Min': item.ft_min,
                                        PER: item.hollingerper
                                    };
                                    quarterData[dateFormat(item['game_date'], "yyyy-mm-dd")].push(record);
                                }

                                res.json({
                                    status: true,
                                    quarterData: quarterData,
                                    exportedQuarterData: exportedQuarterData}).status(200);
                            } else {
                                playerModel
                                    .getMostQuarterDataByPlayerId(playerId, teamId, end)
                                    .then(
                                        (recent) => {
                                            if (recent.rowCount) {
                                                let date = recent.rows[0]['game_date'];

                                                return res.json({
                                                    status: true,
                                                    warning: true,
                                                    message: 'No data for ' + playerId + ' until ' + dateFormat(date, "yyyy-mm-dd")}).status(200);
                                            } else {
                                                res.json({status: false, message: 'player quarter level data not found'}).status(404);
                                            }
                                        }
                                    )
                                    .catch(
                                        (modelErr) => {
                                            return res.json({status: false, message: 'Please contact developer: error code 4005'}).status(400);
                                        }
                                    )

                            }
                        }
                    )
                    .catch(
                        (modelError) => {
                            console.log(modelError);
                            return res.json({status: false, message: 'please contact developer: error code 4006'}).status(400);
                        }
                    )
            }
        })().catch(e => setImmediate(() => { res.send(e) }));
    }


    function getSeason(req, res) {
        playerModel
            .getSeason()
            .then(
                (modelRes) => {
                    if (modelRes.rowCount) {
                        return res.json({status: true, season: modelRes.rows}).status(200);
                    } else {
                        return res.json({status: true, message: 'season data not found'}).status(404);
                    }
                }
            )
            .catch(
                (modelError) => {
                    return res.json({status: false, message: 'please contact developer: error code 4004'}).status(400);
                }
            )
    }

    function compareDate(date1, date2) {
        return (date1.getFullYear() === date2.getFullYear()) && (date1.getMonth() === date2.getMonth()) && (date1.getDate() === date2.getDate())
    }

    function getGaugesByPlayerId(req, res) {
        let teamId = req.params.teamId;
        let userId = req.params.userId;


        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                let playerId = req.params.playerId;
                let qdate = dateFormat(req.query['date'], "isoUtcDateTime");
                playerModel
                    .getGaugesByPlayerId(playerId, teamId, qdate)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let row = modelRes.rows[0];
                                let date = new Date(row.game_date);
                                let required_date = new Date(qdate);

                                let playerInfo = {

                                    sevenDayAverageMechanicalIntensity: row.mechanical_int_gauge_value,
                                    sevenDayAverageMechanicalIntensityUpper: row.mechanical_int_gauge_upper,
                                    sevenDayAverageMechanicalIntensityLower: row.mechanical_int_gauge_lower,
                                    sevenDayAverageMechanicalIntensityColor: colorMap[row.mechanical_int_gauge_color],

                                    sevenDayAveragePhysioLoad: row.physio_load_gauge_value,
                                    sevenDayAveragePhysioLoadUpper: row.physio_load_gauge_upper,
                                    sevenDayAveragePhysioLoadLower: row.physio_load_gauge_lower,
                                    sevenDayAveragePhysioLoadColor: colorMap[row.physio_load_gauge_color],

                                    sevenDayAverageAccel3PerMinute: row.accel_3_min_gauge_value,
                                    sevenDayAverageAccel3PerMinuteUpper: row.accel_3_min_gauge_upper,
                                    sevenDayAverageAccel3PerMinuteLower: row.accel_3_min_gauge_lower,
                                    sevenDayAverageAccel3PerMinuteColor: colorMap[row.accel_3_min_gauge_color],

                                    sevenDayAveragePER: row.hollingerper_gauge_value,
                                    sevenDayAveragePERUpper: row.hollingerper_gauge_upper,
                                    sevenDayAveragePERLower: row.hollingerper_gauge_lower,
                                    sevenDayAveragePERColor: colorMap[row.hollingerper_gauge_color],

                                    fourteenDayAcuteChronicMechanicalIntensity: row.mechanical_int_acr_gauge_value,
                                    fourteenDayAcuteChronicMechanicalIntensityColor: colorMap[row.mechanical_int_acr_gauge_color],

                                    fourteenDayAcuteChronicPhysioLoad: row.physio_load_acr_gauge_value,
                                    fourteenDayAcuteChronicPhysioLoadColor: colorMap[row.physio_load_acr_gauge_color],

                                };
                                if (compareDate(date, required_date)) {
                                    return res.json({status: true, playerInfo: playerInfo}).status(200);
                                } else {
                                    for (i in playerInfo) {
                                        playerInfo[i] = 0;
                                    }
                                    return res.json({
                                        status: true,
                                        notice: true,
                                        message: 'Most recent player gauges data you can get is for ' + date.toISOString(),
                                        playerInfo: playerInfo}).status(404);
                                }

                            } else {
                                return res.json({status: true, message: 'player gauge data not found'}).status(404);
                            }
                        }
                    )
                    .catch(
                        (modelError) => {
                            console.log(modelError);
                            return res.json({status: false, message: 'please contact developer: error code 4002'}).status(400);
                        }
                    )
            }
        })().catch(e => setImmediate(() => { res.send(e) }));
    }

    function computeSeason(dateString) {
        t = new Date(dateString);

        if (t <= new Date('06/17/2018') && t >= new Date('09/12/2017')) {return dateFormat('09/12/2017', "isoUtcDateTime")}
        if (t <= new Date('06/12/2017') && t >= new Date('10/25/2016')) {return dateFormat('10/25/2016', "isoUtcDateTime")}
        if (t <= new Date('05/27/2015') && t >= new Date('10/28/2014')) {return dateFormat('10/28/2014', "isoUtcDateTime")}

    }

    function getPlayerInfoByPlayerId(req, res) {

        let teamId = req.params.teamId;
        let userId = req.params.userId;
        let end_date = req.query['end_date'];
        let start_date = req.query['start_date'];

        (async () => {
            const {rowCount} = await teamModel.checkTeamAccess(userId, teamId);
            if (rowCount <= 0) {
                return res.json({status: false, message: 'Access denied. Please contact Cardinal Advising staff for further access granted. '}).status(400);
            } else {
                let playerId = req.params.playerId;
                let start = dateFormat(start_date, 'isoUtcDateTime');
                let end = dateFormat(end_date, 'isoUtcDateTime');

                playerModel
                    .getPlayerInfoByPlayerId(playerId, teamId, end, start)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                let row = modelRes.rows[0];
                                // console.log(row);
                                let summaryData = modelRes.rows.map(item => {return {
                                    'Game Date': dateFormat(item.game_date, "yyyy-mm-dd"),
                                    Location: item.home_away,
                                    Opponent: item.opponent,
                                    Result: item.win_loss,
                                    Minutes: item.minutes,
                                    'Feet/Min': item.ft_min,
                                    'Mechanical Load': item.mechanical_load,
                                    'Physio Load': item.physio_load,
                                    'Mechanical Intensity': item.mechanical_int,
                                    'Defensive Mechanical Intensity': item.def_mechanical_int,
                                    'Offensive Mechanical Intensity': item.off_mechanical_int,
                                    'Accel3/Min': item.accel_3_min,
                                    PER: item.hollingerper,
                                    'Minutes Color': item.minutes_color,
                                    'Feet/Min Color': item.ft_min_color,
                                    'Physio Load Color': item.physio_load_color,
                                    'Mechanical Load Color': item.mechanical_load_color,
                                    'Mechanical Intensity Color': item.mechanical_int_color,
                                    'Offensive Mechanical Intensity Color': item.off_mechanical_int_color,
                                    'Defensive Mechanical Intensity Color': item.def_mechanical_int_color,
                                    'Accel3/Min Color': item.accel_3_min_color,
                                    'PER Color': item.hollingerper_color
                                }});
                                let colorEncodedColNames = [
                                    'Minutes',
                                    'Physio Load',
                                    'Mechanical Load',
                                    'Mechanical Intensity',
                                    'Defensive Mechanical Intensity',
                                    'Offensive Mechanical Intensity',
                                    'Accel3/Min',
                                    'Feet/Min',
                                    'PER',
                                ];
                                let colNames = ['Game Date', 'Location', 'Opponent', 'Result'];
                                res.json({
                                    status: true,
                                    playerImage: row.img_loc,
                                    playerName: row.player,
                                    summaryData: summaryData,
                                    colorEncodedColNames: colorEncodedColNames,
                                    colNames: colNames}).status(200);
                            } else {
                                playerModel
                                    .getMostRecentPlayerInfoByplayerId(playerId, teamId, end)
                                    .then(
                                        (recent) => {
                                            if (recent.rowCount) {
                                                let row = recent.rows[0];
                                                let date = new Date(row.game_date);
                                                let summaryDataRow = {
                                                    'Game Date': '',
                                                    Location: null,
                                                    Opponent: null,
                                                    Result: null,
                                                    'Feet/Min': null,
                                                    Minutes: null,
                                                    'Mechanical Load': null,
                                                    'Physio Load': null,
                                                    'Mechanical Intensity': null,
                                                    'Defensive Mechanical Intensity': null,
                                                    'Offensive Mechanical Intensity': null,
                                                    'Accel3/Min': null,
                                                    PER: null,
                                                    'Minutes Color': null,
                                                    'Physio Load Color': null,
                                                    'Mechanical Load Color': null,
                                                    'Mechanical Intensity Color': null,
                                                    'Offensive Mechanical Intensity Color': null,
                                                    'Defensive Mechanical Intensity Color': null,
                                                    'Accel3/Min Color': null,
                                                    'PER Color': null
                                                };
                                                return res.json({
                                                    status: true,
                                                    warning: true,
                                                    playerImage: row.img_loc,
                                                    playerName: row.player,
                                                    summaryData: [summaryDataRow],
                                                    message: 'No data for ' + playerId + ' until ' + dateFormat(date, "yyyy-mm-dd")}).status(200);
                                            } else {
                                                res.json({status: false, message: 'player info not found'}).status(404);
                                            }
                                        }
                                    )
                                    .catch(
                                        (modelErr) => {
                                            return res.json({status: false, message: 'Please contact developer: error code 4003'}).status(400);
                                        }
                                    )

                            }
                        }
                    )
                    .catch(
                        (modelError) => {
                            console.log(modelError);
                            return res.json({status: false, message: 'please contact developer: error code 4001'}).status(400);
                        }
                    )
            }
        })().catch(e => setImmediate(() => { res.send(e) }));

    }







};
