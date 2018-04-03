module.exports = function (pool) {


    let api = {
        getPlayerInfoByPlayerId: getPlayerInfoByPlayerId,
        getGaugesByPlayerId: getGaugesByPlayerId,
        getMostRecentPlayerInfoByplayerId: getMostRecentPlayerInfoByplayerId,
        getQuarterDataByPlayerId: getQuarterDataByPlayerId,
        getMostQuarterDataByPlayerId: getMostQuarterDataByPlayerId,
        getSeason: getSeason
    };
    return api;

    function getMostQuarterDataByPlayerId(playerId, teamId, end) {
        let queryObj = {
            text: "select game_date from cardinal_webapp.nba_stats.vw_redflag_quarter_csv where player = $1 and team_abbr = $2 and game_date <= $3 order by game_date desc limit 1",
            values: [playerId, teamId, end]
        };


        return pool.query(queryObj);
    }

    function getQuarterDataByPlayerId(playerId, teamId, start, end) {
        let queryObj = {
            text: "select " +
            "game_date, " +
            "period, " +
            "home_away, " +
            "opponent, " +
            "win_loss, " +
            "round(minutes::numeric, 2) as minutes, " +
            "round(ft_min::numeric, 2) as ft_min, " +
            "round(mechanical_load::numeric, 2) as mechanical_load, " +
            "round(physio_load::numeric, 2) as physio_load, " +
            "round(physio_intensity::numeric, 2) as physio_intensity, " +
            "round(mechanical_int::numeric, 2) as mechanical_int, " +
            "round(def_mechanical_int::numeric, 2) as def_mechanical_int," +
            "round(off_mechanical_int::numeric, 2) as off_mechanical_int, " +
            "round(accel_3_min::numeric, 2) as accel_3_min, " +
            "round(hollingerper::numeric, 2) as hollingerper " +
            "from cardinal_webapp.nba_stats.vw_redflag_quarter_csv " +
            "where period != 0 and player = $1 and team_abbr = $2 and $3 <= game_date and game_date <= $4 order by game_date desc, period",
            values: [playerId, teamId, start, end]
        };


        return pool.query(queryObj);
    }

    function getSeason() {
        let queryObj = "select * from cardinal_webapp.app_admin.season order by start_date desc";

        return pool.query(queryObj);
    }

    function getMostRecentPlayerInfoByplayerId(playerId, teamId, end) {
        let queryObj = {
            text: "select game_date, player, img_loc from cardinal_webapp.nba_stats.red_flag_app where player = $1 and team_abbr = $2 and game_date <= $3 order by game_date desc limit 1",
            values: [playerId, teamId, end]
        };


        return pool.query(queryObj);
    }

    function getPlayerInfoByPlayerId(playerId, teamId, end, start) {

        let queryObj = {
            text: "select " +
            "a.player, " +
            "a.team, " +
            "a.game_date, " +
            "a.home_away, " +
            "a.opponent, " +
            "a.win_loss, " +
            "round(a.minutes::numeric, 2) as minutes, " +
            "round(a.ft_min::numeric, 2) as ft_min, " +
            "round(a.mechanical_load::numeric, 2) as mechanical_load, " +
            "round(a.physio_load::numeric, 2) as physio_load, " +
            "round(a.mechanical_int::numeric, 2) as mechanical_int, " +
            "round(a.def_mechanical_int::numeric, 2) as def_mechanical_int," +
            "round(a.off_mechanical_int::numeric, 2) as off_mechanical_int, " +
            "round(a.accel_3_min::numeric, 2) as accel_3_min, " +
            "a.img_loc, " +
            "round(a.hollingerper::numeric, 2) as hollingerper, " +
            "a.minutes_color, " +
            "a.physio_load_color, " +
            "a.ft_min_color, " +
            "a.mechanical_load_color, " +
            "a.mechanical_int_color, " +
            "a.off_mechanical_int_color, " +
            "a.def_mechanical_int_color, " +
            "a.accel_3_min_color, " +
            "a.hollingerper_color " +
            "from cardinal_webapp.nba_stats.red_flag_app a " +
            "where a.player = $1 and a.team_abbr = $2 and $4 <= a.game_date and a.game_date <= $3 order by game_date desc",
            values: [playerId, teamId, end, start]
        };


        return pool.query(queryObj);
    }
    
    function getGaugesByPlayerId(playerId, teamId, end) {
        let queryObj = {
            text: "select " +
            "round(a.mechanical_int_gauge_value::numeric, 2) as mechanical_int_gauge_value, " +
            "round(a.mechanical_int_gauge_upper::numeric, 2) as mechanical_int_gauge_upper, " +
            "round(a.mechanical_int_gauge_lower::numeric, 2) as mechanical_int_gauge_lower, " +
            "a.mechanical_int_gauge_color, " +
            "round(a.physio_load_gauge_value::numeric, 2) as physio_load_gauge_value, " +
            "round(a.physio_load_gauge_upper::numeric, 2) as physio_load_gauge_upper, " +
            "round(a.physio_load_gauge_lower::numeric, 2) as physio_load_gauge_lower, " +
            "a.physio_load_gauge_color, " +
            "round(a.accel_3_min_gauge_value::numeric, 2) as accel_3_min_gauge_value, " +
            "round(a.accel_3_min_gauge_upper::numeric, 2) as accel_3_min_gauge_upper, " +
            "round(a.accel_3_min_gauge_lower::numeric, 2) as accel_3_min_gauge_lower, " +
            "a.accel_3_min_gauge_color, " +
            "round(a.hollingerper_gauge_value::numeric, 2) as hollingerper_gauge_value, " +
            "round(a.hollingerper_gauge_lower::numeric, 2) as hollingerper_gauge_lower, " +
            "round(a.hollingerper_gauge_upper::numeric, 2) as hollingerper_gauge_upper, " +
            "a.hollingerper_gauge_color, " +
            "round(a.mechanical_int_acr_gauge_value::numeric, 2) as mechanical_int_acr_gauge_value, " +
            "a.mechanical_int_acr_gauge_color, " +
            "round(a.physio_load_acr_gauge_value::numeric, 2) as physio_load_acr_gauge_value, " +
            "a.physio_load_acr_gauge_color, " +
            "a.game_date " +
            "from cardinal_webapp.nba_stats.red_flag_app_player_gauges a " +
            "where a.player = $1 and a.team_abbr = $2 and a.game_date <= $3 order by a.game_date desc limit 1",
            values: [playerId, teamId, end]
        };


        return pool.query(queryObj);
    }



    function getPlayerInfoByPlayerId1(playerId) {

        let queryObj = {
            text: "select " +
            "a.player, " +
            "a.team, " +
            "a.game_date, " +
            "a.home_away, " +
            "a.opponent, " +
            "a.win_loss, " +
            "a.minutes, " +
            "a.mechanical_load, " +
            "a.physio_load, " +
            "a.mechanical_int, " +
            "round(a.def_mechanical_int::numeric, 2) as def_mechanical_int," +
            "round(a.off_mechanical_int::numeric, 2) as off_mechanical_int, " +
            "round(a.accel_3_min::numeric, 2) as accel_3_min, " +
            "a.img_loc, " +
            "round(a.hollingerper::numeric, 2) as hollingerper, " +
            "b.minutes_color, " +
            "b.physio_load_color, " +
            "b.mechanical_load_color, " +
            "b.mechanical_int_color, " +
            "b.off_mechanical_int_color, " +
            "b.def_mechanical_int_color, " +
            "b.accel_3_min_color, " +
            "b.hollingerper_color, " +
            "round(a.mechanical_int_7d_mean::numeric, 2) as mechanical_int_7d_mean, " +
            "round(a.physio_load_7d_mean::numeric, 2) as physio_load_7d_mean, " +
            "round(a.accel_3_min_7d_mean::numeric, 2) as accel_3_min_7d_mean, " +
            "round(a.hollingerper_7d_mean::numeric, 2) as hollingerper_7d_mean, " +
            "round(a.mechanical_int_14d_mean::numeric, 2) as mechanical_int_14d_mean, " +
            "round(a.physio_load_14d_mean::numeric, 2) as physio_load_14d_mean " +
            "from cardinal_webapp.nba_stats.red_flag_csv a " +
            "inner join " +
            "cardinal_webapp.nba_stats.red_flag_app b " +
            "on a.game_date = b.game_date and a.player = b.player and a.team = b.team " +
            "where a.person_id = $1 order by a.game_date desc",
            values: [playerId]
        };

        return pool.query(queryObj);
    }


};