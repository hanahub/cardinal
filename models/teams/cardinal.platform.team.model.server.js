module.exports = function (pool) {


    let api = {
        getTeamInfoByTeamId: getTeamInfoByTeamId,
        getPlayerListByTeamId: getPlayerListByTeamId,
        checkTeamAccess: checkTeamAccess,
        getMostRecentTeamInfoByTeamId: getMostRecentTeamInfoByTeamId,
        getTeamRankByTeamId: getTeamRankByTeamId,
        giveTeamAccessToUser: giveTeamAccessToUser,
        removeTeamAccess: removeTeamAccess,
        findTeamByUserId: findTeamByUserId,
        getTrainReportByTeamId: getTrainReportByTeamId,
        getPredictionReportByTeamId: getPredictionReportByTeamId,
        getPerformanceReportByTeamId: getPerformanceReportByTeamId,
        getNGamesReportByTeamId: getNGamesReportByTeamId,
        getTopPlayerReportByTeamId: getTopPlayerReportByTeamId,
        getPlayerSumReportByTeamId: getPlayerSumReportByTeamId,
        getTopPlayerLeagueReport: getTopPlayerLeagueReport,
        getPlayerPositionReportByTeamId: getPlayerPositionReportByTeamId,
    };
    return api;
    
    function getPlayerPositionReportByTeamId(teamId, userType, position) {
        let queryObj = {
            text: 'select * from nba_stats.top10_report where report_date = current_date and team = $1 and position = $2 order by position, mechanical_load_rank',
            values: [teamId, position]
        };

        if (userType === 1 || userType === -1) {
            queryObj.text = 'select * from nba_stats.top10_report where report_date = current_date and position = $2 and mechanical_load_rank <=10 union ' +
                'select * from nba_stats.top10_report where report_date = current_date and team = $1 and position = $2 order by position, mechanical_load_rank'
        }

        return pool.query(queryObj);
    }

    function getTopPlayerLeagueReport() {
        let queryObj = {
            text: 'select * from nba_stats.top_6_perc_league',
            values: []
        };

        return pool.query(queryObj);
    }

    function getPlayerSumReportByTeamId(teamId) {
        let queryObj = {
            text: 'select * from nba_stats.player_sums where team_abbr = $1',
            values: [teamId]
        };

        return pool.query(queryObj);
    }



    function getTopPlayerReportByTeamId(teamId) {
        let queryObj = {
            text: 'select round(perc_mins::numeric, 2) as perc_mins' +
            ', round(perc_pl::numeric, 2) as perc_pl' +
            ', round(perc_ml::numeric, 2) as perc_ml' +
            ', round(perc_distance::numeric, 2) as perc_distance ' +
            'from nba_stats.top_6_perc ' +
            'where team_abbr = $1',
            values: [teamId]
        };

        return pool.query(queryObj);
    }

    function getNGamesReportByTeamId(teamId, start, end) {
        let queryObj = {
            text: 'select ' +
            'player' +
            ', team' +
            ', count(game_date) as games' +
            ', round(avg(minutes)::numeric, 2) as minutes' +
            ', round(avg(distance)::numeric, 2) as distance' +
            ', round(avg(physio_load)::numeric, 2) as physio_load' +
            ', round(avg(physio_intensity)::numeric, 2) as physio_intensity' +
            ', round(avg(mechanical_load)::numeric, 2) as mechanical_load' +
            ', round(avg(mechanical_int)::numeric, 2) as mechanical_int' +
            ', round(avg(off_mechanical_int)::numeric, 2) as off_mechanical_int' +
            ', round(avg(def_mechanical_int)::numeric, 2) as def_mechanical_int' +
            ', round(avg(accel_3_min)::numeric, 2) as acc3min' +
            ', round(avg(ft_min)::numeric, 2) as ft_min' +
            ', round(avg(accel_1 + accel_2 + accel_3 + accel_4 + decel_1 + decel_2 + decel_3 + decel_4)::numeric, 2) as accels_decels ' +
            'from nba_stats.vw_redflag_csv ' +
            'where game_date >= $2 and game_date <= $3 and team_abbr = $1 ' +
            'group by player, team ' +
            'order by games desc',
            values: [teamId, start, end]
        };

        return pool.query(queryObj);
    }

    function getPerformanceReportByTeamId(teamId, userType, period) {
        let queryObj = {
            text: '',
            values: []
        };

        if (userType === 2) {
            queryObj.text = "select player, team, season, team_abbr, position, home_away, to_char(game_date, 'YYYY-MM-DD') as game_date, win_loss, opponent, period, minutes, distance, physio_load, physio_intensity, mechanical_load, mechanical_int, off_mechanical_int, def_mechanical_int, accel_3_min, ft_min, hollingerper, accel_1, accel_2, accel_3, accel_4, decel_1, decel_2, decel_3, decel_4 from cardinal_webapp.nba_stats.vw_redflag_quarter_csv where team_abbr = $1";
            queryObj.values = [teamId];
            if (period >= 0) {
                queryObj.text = 'select player, team, season, team_abbr, position, home_away, to_char(game_date, \'YYYY-MM-DD\') as game_date, win_loss, opponent, period, minutes, distance, physio_load, physio_intensity, mechanical_load, mechanical_int, off_mechanical_int, def_mechanical_int, accel_3_min, ft_min, hollingerper, accel_1, accel_2, accel_3, accel_4, decel_1, decel_2, decel_3, decel_4 from cardinal_webapp.nba_stats.vw_redflag_quarter_csv where team_abbr = $1 and period = $2';
                queryObj.values = [teamId, period];
            }
        }

        if (userType === 1 || userType === -1) {
            queryObj.text = 'select player, team, season, team_abbr, position, home_away, to_char(game_date, \'YYYY-MM-DD\') as game_date, win_loss, opponent, period, minutes, distance, physio_load, physio_intensity, mechanical_load, mechanical_int, off_mechanical_int, def_mechanical_int, accel_3_min, ft_min, hollingerper, accel_1, accel_2, accel_3, accel_4, decel_1, decel_2, decel_3, decel_4 from cardinal_webapp.nba_stats.vw_redflag_quarter_csv';
            queryObj.values = [];
            if (period >= 0) {
                queryObj.text = 'select player, team, season, team_abbr, position, home_away, to_char(game_date, \'YYYY-MM-DD\') as game_date, win_loss, opponent, period, minutes, distance, physio_load, physio_intensity, mechanical_load, mechanical_int, off_mechanical_int, def_mechanical_int, accel_3_min, ft_min, hollingerper, accel_1, accel_2, accel_3, accel_4, decel_1, decel_2, decel_3, decel_4 from cardinal_webapp.nba_stats.vw_redflag_quarter_csv where period = $1';
                queryObj.values = [period];
            }
        }

        return pool.query(queryObj);
    }

    function getPredictionReportByTeamId(teamId, start) {
        let queryObj = {
            text: 'select ' +
            'player, ' +
            'team_abbr, ' +
            'location, ' +
            'game_date, ' +
            'extract(dow from game_date) as weekday, ' +
            'opponent_abbr, ' +
            'round(opponent_pl_avg::numeric, 2) as opponent_pl_avg,' +
            'round(opponent_ml_avg::numeric, 2) as opponent_ml_avg, ' +
            'round(opponent_mi_avg::numeric, 2) as opponent_mi_avg, ' +
            'round(opponent_acc3min_avg::numeric, 2) as opponent_acc3min_avg, ' +
            'round(z_pl::numeric, 2) as z_pl, ' +
            'round(z_ml::numeric, 2) as z_ml, ' +
            'round(z_mi::numeric, 2) as z_mi, ' +
            'round(z_acc3min::numeric, 2) as z_acc3min ' +
            'from cardinal_webapp.nba_stats.prediction_app_data ' +
            'where team_abbr = $1 and game_date between $2::date and $2::date + interval \'6 days\' order by game_date::date',
            values: [teamId, start]
        };

        return pool.query(queryObj);
    }

    function getTrainReportByTeamId(teamId) {
        let queryObj = {
            text: 'select * from cardinal_webapp.nba_stats.training_app_data where team_abbr = $1',
            values: [teamId]
        };

        if (teamId === 'SUM') {
            queryObj = {
                text: 'select * from cardinal_webapp.nba_stats.training_app_data',
                values: []
            };
        }

        return pool.query(queryObj);
    }

    function removeTeamAccess(userId, team) {
      let queryObj = {
        text: 'delete from cardinal_webapp.app_admin.user_team where user_id = $1 and team = $2',
        values: [userId, team]
      };

      return pool.query(queryObj);
    }

    function giveTeamAccessToUser(userId, team, league, teamAbbr) {
      let queryObj = {
        text: 'insert into cardinal_webapp.app_admin.user_team(user_id, team, league, team_abbr, created_time) values($1, $2, $3, $4, now())',
        values: [userId, team, league, teamAbbr]
      };

      return pool.query(queryObj);
    }

    function findTeamByUserId(userId, teamAbbr) {
      let queryObj = {
        text: 'select * from cardinal_webapp.app_admin.user_team where user_id = $1 and team_abbr = $2',
        values: [userId, teamAbbr]
      };

      return pool.query(queryObj);
    }

    function getTeamRankByTeamId(teamId, date) {
        let queryObj = {
            text: "select " +
            "distance_rank, " +
            "distance_color, " +
            "physio_load_rank, " +
            "physio_load_color, " +
            "mechanical_int_rank, " +
            "mechanical_int_color " +
            "from " +
            "cardinal_webapp.nba_stats.red_flag_app_team_gauges " +
            "where " +
            "team_abbr = $1 and game_date = $2 limit 1",
            values: [teamId, date]
        };


        return pool.query(queryObj);
    }


    function getMostRecentTeamInfoByTeamId(teamId, date) {
        let queryObj = {
            text: "select game_date, team, team_logo_loc from cardinal_webapp.nba_stats.red_flag_app_team where team_abbr = $1 and game_date <= $2::date order by game_date desc limit 1",
            values: [teamId, date]
        };


        return pool.query(queryObj);
    }


    function checkTeamAccess(userId, teamId) {
        let queryObj = {
            text: "select user_id, team_abbr from cardinal_webapp.app_admin.user_team where user_id = $1 and team_abbr = $2",
            values: [userId, teamId]
        };

        return pool.query(queryObj);

    }

    function getPlayerListByTeamId(teamId, season) {
        let queryObj = {
            text: "select distinct(player) as player from cardinal_webapp.nba_stats.red_flag_app_team " +
            "where season = $2 and team_abbr = $1 and player is not null and player != ' ' order by player",
            values: [teamId, season]
        };

        return pool.query(queryObj);
    }

    function getTeamInfoByTeamId(teamId, end, start) {
        let queryObj = {
            text: "select " +
            "a.team_logo_loc, " +
            "a.team, " +
            "a.team_abbr, " +
            "a.player, " +
            "a.season, " +
            "round(a.minutes::numeric, 2) as minutes, " +
            "a.games as games, " +
            "round(a.physio_load::numeric, 2) as physio_load, " +
            "round(a.ft_min::numeric, 2) as ft_min, " +
            "round(a.accel_3_min::numeric, 2) as accel_3_min, " +
            "round(a.mechanical_int::numeric, 2) as mechanical_int, " +
            "round(a.mechanical_load::numeric, 2) as mechanical_load, " +
            "a.mechanical_int_color, " +
            "a.mechanical_load_color, " +
            "a.physio_load_color, " +
            "a.accel_3_min_color, " +
            "a.game_date, a.mechanical_int_gauge_color, a.accel_3_min_gauge_color, a.mechanical_int_acr_gauge_color " +
            "from cardinal_webapp.nba_stats.red_flag_app_team a " +
            "where a.team_abbr = $1 and a.game_date = $2",
            values: [teamId, end]
        };

        // console.log(queryObj.text);

        return pool.query(queryObj);
    }


};
