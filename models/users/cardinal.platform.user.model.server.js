module.exports = function (pool) {

    let api = {
        getUserByUserId : getUserByUserId,
        findTeamListByUserId: findTeamListByUserId,
        findUserByCredentials: findUserByCredentials,
        updateUserByUserInfo: updateUserByUserInfo,
        findUserByUsername: findUserByUsername,
        logLoginTime: logLoginTime,
        findAllUsers: findAllUsers,
        removeUser: removeUser,
        newUser: newUser,
        resetUserCredentials: resetUserCredentials,
        findUserType: findUserType,
        generateUUID: generateUUID,
        countLoginFailure: countLoginFailure,
        setLoginFailure: setLoginFailure
    };
    return api;

    function setLoginFailure(username, newValue) {
        let queryObj = {
            text: 'update cardinal_webapp.app_admin.account set login_failure = $1 where username = $2',
            values: [newValue, username]
        };

        return pool.query(queryObj);
    }

    function countLoginFailure(username) {
        let queryObj = {
            text: 'select login_failure from cardinal_webapp.app_admin.account where username = $1',
            values: [username]
        };

        return pool.query(queryObj);
    }

    function generateUUID() {
      let queryObj = 'select uuid_generate_v4() as uuid';

      return pool.query(queryObj);
    }

    function findAllUsers() {
      let queryObj = 'select user_id, username, user_type, email, last_login_time, login_failure from cardinal_webapp.app_admin.account order by username asc';

      return pool.query(queryObj);
    }

    function findUserType(userId) {
      let queryObj = {
        text: 'select user_type from cardinal_webapp.app_admin.account where user_id = $1',
        values: [userId]
      }

      return pool.query(queryObj);
    }

    function newUser(userId, username, password, userType, email) {
      let queryObj = {
        text: 'insert into cardinal_webapp.app_admin.account(user_id, username, password, user_type, email, created_time) values($1, $2, $3, $4, $5, (select now()))',
        values: [userId, username, password, userType, email]
      }

      return pool.query(queryObj);
    }

    function removeUser(userId) {
      let queryObj = {
        text: 'delete from cardinal_webapp.app_admin.account where user_id = $1',
        values: [userId]
      }

      return pool.query(queryObj);
    }

    function resetUserCredentials(username, email, password, userId) {
      let queryObj = {
        text: 'update cardinal_webapp.app_admin.account set username = $1, email = $2, password = $3 where user_id = $4',
        values: [username, email, password, userId]
      }
      return pool.query(queryObj);
    }

    function logLoginTime(userId) {
      let queryObj = {
          text: "update cardinal_webapp.app_admin.account set last_login_time = (select now()) where user_id = $1",
          values: [userId]
      };

      return pool.query(queryObj);
  }

    function findUserByUsername(username) {
        let queryObj = {
            text: "select user_id, user_type, username, password, email from cardinal_webapp.app_admin.account where username = $1",
            values: [username]
        };

        return pool.query(queryObj);
    }

    function updateUserByUserInfo(username, new_password, email, userId) {
        let queryObj = {
            text: "update cardinal_webapp.app_admin.account set username = $1, password = $2, email = $3 where user_id = $4",
            values: [username, new_password, email, userId]
        };

        return pool.query(queryObj);
    }

    function getUserByUserId(userId) {
        let queryObj = {
            text: "select user_id, username, password, email, created_time, user_type from cardinal_webapp.app_admin.account where user_id = $1",
            values: [userId]
        };

        return pool.query(queryObj);
    }


    function findUserByCredentials(username, password) {

        let queryObj = {
            text: "select user_id from cardinal_webapp.app_admin.account where username = $1 and password = $2",
            values: [username, password]
        };


        return pool.query(queryObj);

    }

    function findTeamListByUserId(userId) {

        let queryObj = {
            text: "select team, team_abbr, league from cardinal_webapp.app_admin.user_team where user_id = $1 order by team_abbr asc",
            values: [userId]
        };

        return pool.query(queryObj);
    }

};
