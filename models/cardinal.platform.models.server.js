module.exports = function () {

    //connect to postgresQL database
    const {Pool} = require('pg');

    let connectionString = 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb';

    let POSTGRES_DB_USERNAME = 'nba_webapp';
    let POSTGRES_DB_PASSWORD = 'af3*ipJ3p$';
    let POSTGRES_DB_HOST = 'postgres.cardinal.coach';
    let POSTGRES_DB_PORT = '5432';
    let POSTGRES_DB_BASE_NAME = 'cardinal_webapp';
    // console.log(process.env);
    connectionString = "postgresql://" + POSTGRES_DB_USERNAME + ":" +
            POSTGRES_DB_PASSWORD + "@" +
            POSTGRES_DB_HOST + ':' +
            POSTGRES_DB_PORT + '/' +
            POSTGRES_DB_BASE_NAME;

    if(process.env.POSTGRES_DB_PASSWORD) {
        connectionString = "postgresql://" + process.env.POSTGRES_DB_USERNAME + ":" +
            process.env.POSTGRES_DB_PASSWORD + "@" +
            process.env.POSTGRES_DB_HOST + ':' +
            process.env.POSTGRES_DB_PORT + '/' +
            process.env.POSTGRES_DB_BASE_NAME;
    }

    const pool = new Pool({
        connectionString: connectionString
    });


    let models = {
        userModel: require("./users/cardinal.platform.user.model.server")(pool),
        teamModel: require("./teams/cardinal.platform.team.model.server")(pool),
        playerModel: require("./players/cardinal.platform.player.model.server")(pool)
    };

    return models;
}