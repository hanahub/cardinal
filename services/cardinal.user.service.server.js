module.exports = function(app, models) {

    const bcrypt = require("bcrypt-nodejs");
    const userModel = models.userModel;
    const passport = require('passport');
    const LocalStrategy = require('passport-local').Strategy;
    passport.use(new LocalStrategy(localStrategyHandler));
    passport.serializeUser(serializeUser);
    passport.deserializeUser(deserializeUser);

    app.post('/api/login', passport.authenticate('local'), login);
    app.post("/api/user/:userId", register);
    app.post("/api/logout", logout);

    app.get("/api/logged_in", loggedIn);
    app.get("/api/user", findUserByCredentials);
    app.get("/api/user/:userId", findUserTeamInfoById);
    app.get('/api/user/:userId/usertype', returnUserType);

    app.put("/api/user/:userId", updateUser);

    function loggedIn(req, res) {
        if (req.isAuthenticated()) {
            res.json(req.user);
        } else {
            res.json({status: false});
        }
    }


    function serializeUser(userInfo, done) {
        done(null, userInfo);
    }


    function returnUserType(request, response) {

      const error_msg = 'An error occurred while trying to retrieve users type. ';

      if (request.user.user_type) {
          return response.json({ status: true, user_type: parseInt(request.user.user_type) }).status(200);
      } else {
          return response.json({ status: false, message: error_msg }).status(400);
      }
      // userModel
      //   .findUserType(userId)
      //   .then(
      //     modelRes => {
      //       return response.json({ status: true, user_type: modelRes.rows[0].user_type });
      //     }
      //   )
      //   .catch(
      //     error => {
      //         return response.json({ status: false, message: error_msg }).status(400);
      //     }
      //   )
    }


    function deserializeUser(userInfo, done) {
        userModel
            .getUserByUserId(userInfo.user_id)
            .then(
                (modelRes) => {
                    if (modelRes.rowCount) {
                        done(null, userInfo);
                    } else {
                        let userInfo = {status: false, message: 'invalid user ID'};
                        done(null, userInfo);
                    }

                }
            )
            .catch(
                (modelErr) => {
                    done(modelErr, false);
                }
            )
    }

    function localStrategyHandler(username, password, done) {
        (async () => {
            let cnt = await userModel.countLoginFailure(username);
            cnt = cnt.rows[0] ? cnt.rows[0].login_failure : 0;

            if(cnt <= 7) {
                let userInfo = null;
                userModel
                    .findUserByUsername(username)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount) {
                                if (bcrypt.compareSync(password, modelRes.rows[0].password)) {
                                    userInfo = {
                                        status: true,
                                        user_id: modelRes.rows[0].user_id,
                                        user_type: parseInt(modelRes.rows[0].user_type),
                                        username: modelRes.rows[0].username,
                                        email: modelRes.rows[0].email};
                                    done(null, userInfo);
                                } else {
                                    userModel
                                        .setLoginFailure(username, cnt + 1)
                                        .then(
                                            () => {
                                                userInfo = {status: false, message: 'incorrect username or password'};
                                                done(null, userInfo);
                                            }
                                        )
                                        .catch(
                                            (error) => {
                                                userInfo = {status: false, message: 'please contact developer with error code 1003. '};
                                                done(null, userInfo);
                                            }
                                        )
                                }
                            } else {
                                userInfo = {status: false, message: 'incorrect username or password'};
                                done(null, userInfo);
                            }
                        })
                    .catch(
                        (modelErr) => {
                            userInfo = {status: false, message: 'please contact developer with error code 1001. '};
                            done(null, userInfo);
                        });
            } else {
                userInfo = {status: false, message: 'Your account has been locked. Please consult Cardinal for details. '};
                done(null, userInfo);
            }
        })().catch(e => setImmediate(() => { console.log(e) }));

    }

    function login(req, res) {
        userModel.logLoginTime(req.user.user_id);
        userModel.setLoginFailure(req.user.username, 0);
        res.json(req.user);
    }

    function checkAlphanumeric(e) {
        let i = 0, len = e.length, code = 0;

        if (len <= 0) return false;

        for (i = 0; i < len; i++) {
            code = e.charCodeAt(i);
            if (!(code > 47 && code < 58) && // numeric (0-9)
                !(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123)) { // lower alpha (a-z)
                return false;
            }
        }
        return true;

    }

    function checkInvCode(e) {
        let i = 0, len = e.length, code = 0;

        if (len <= 0) return false;

        for (i = 0; i < len; i++) {
            code = e.charCodeAt(i);
            if (!(code > 47 && code < 58) && // numeric (0-9)
                !(code > 64 && code < 91) && // upper alpha (A-Z)
                !(code > 96 && code < 123) && (e[i] !== '-')) { // lower alpha (a-z)
                return false;
            }
        }

        return true;
    }

    function register(req, res) {
        let userId = req.params.userId;
        let username = req.body.data.username;
        const new_password  = req.body.data.new_password;
        const new_password_hashed  = bcrypt.hashSync(new_password);
        let email = req.body.data.email;

        if (!checkInvCode(userId) || userId.split('-').length !== 5) {
            return res.json({status: false, message: invalid_inv_msg}).status(400);
        }
        if (!checkAlphanumeric(username)) {
            return res.json({status: false, message: 'Username should be alphanumeric and not empty. '}).status(400);
        }
        if (!checkAlphanumeric(new_password) || new_password.length < 6) {
            return res.json({status: false, message: 'Password should be alphanumeric and at least 6-character long. '}).status(400);
        }
        if (!email) {return res.json({status: false, message: 'Email should not be empty. '}).status(400);}

        const welcome_msg = "Congratulations! You've registered to Cardinal Advising Sports Analytics Platform. Please click to login with your credentials.";

        userModel
            .findUserByUsername(username)
            .then(
                (modelRes) => {
                    if (modelRes.rowCount) {
                        return res.json({status: false, message: 'The username you entered is in use. Try another one please.'}).status(400);
                    } else {
                        userModel
                            .getUserByUserId(userId)
                            .then(
                                (getUserRes) => {
                                    if (getUserRes.rowCount === 1 && !getUserRes.rows[0].username) {
                                        userModel
                                            .updateUserByUserInfo(username, new_password_hashed, email, userId)
                                            .then(
                                                (regRes) => {
                                                    return res.json({
                                                        status: true,
                                                        message: welcome_msg}).status(200);
                                                }
                                            )
                                            .catch(
                                                (regErr) => {
                                                    return res.json({status: false, message: 'Please contact developer with error code 1002. '}).status(400);
                                                }
                                            )
                                    } else {
                                        return res.json({status: false, message: invalid_inv_msg}).status(400);
                                    }
                                }
                            )
                            .catch(
                                (getUserErr) => {
                                    return res.json({status: false, message: invalid_inv_msg}).status(400);
                                }
                            )

                    }
                }
            )
            .catch(
            (pwModelErr) => {
                return res.json({status: false, message: 'Please contact developer with error code 1004. '}).status(400);
            }
        )

    }

    function logout(req, res) {
        req.logout();
        res.sendStatus(200);
    }


    function findUserByUsername(username, res) {
        userModel
            .findUserByUsername(username)
            .then(
                function (user) {
                    res.json(user);
                },
                function (error) {
                    res.status(404).send(error);
                }
            );
    }

    function findUserByCredentials(req, res) {

        let username = req.query['username'];
        let password = req.query['password'];

        userModel
            .findUserByUsername(username)
            .then(
                (modelRes) => {
                    if (modelRes.rowCount && bcrypt.compareSync(password, modelRes.rows[0].password)) {
                        return res.json({status: true, user_id: modelRes.rows[0].user_id}).status(200);
                    } else {
                        return res.json({status: false, message: 'incorrect username or password'}).status(404);
                    }
                })
            .catch(
                (modelErr) => {
                    return res.json({status: false, message: 'please contact developer: error code 1001'}).status(400);
                });

    }



    function findUserTeamInfoById(req, res) {
        let id = req.params.userId;

        userModel
            .findTeamListByUserId(id)
            .then(
                (modelRes) => {
                    let teams = modelRes.rows.map(item => {return {teamId: item.team_abbr, league: item.league, team: item.team}});
                    return res.json({status: true, teams: teams}).status(200);
                }
            )
            .catch(
                (getUserErr) => {
                    return res.json({status: false, message: 'please contact developer: error code 2002'}).status(404);
                }
            )
    }

    function updateUser(req, res) {
        let id = req.params.userId;
        let pw = req.body.data;

        if (!checkAlphanumeric(pw.new_password) || pw.new_password.length < 6) {
            return res.json({status: false, message: 'Password should be alphanumeric and at least 6-character long. '}).status(400);
        }

        let encoded_new_password = bcrypt.hashSync(pw.new_password);

        if (bcrypt.compareSync(pw.old_password, encoded_new_password)) {
            return res.json({status: false, message: 'Please use a new password. '}).status(400)
        }
        if (!bcrypt.compareSync(pw.confirm_password, encoded_new_password)) {
            return res.json({status: false, message: 'Confirming password inconsistent. '}).status(400)
        }

        userModel
            .getUserByUserId(id)
            .then(
                (modelRes) => {
                    if (modelRes.rowCount && bcrypt.compareSync(pw.old_password, modelRes.rows[0].password)) {
                        userModel
                            .updateUserByUserInfo(pw.username, encoded_new_password, pw.email, id)
                            .then(
                                (pwModelRes) => {
                                    return res.json({status: true, message: 'password updated'}).status(200);
                                }
                            )
                            .catch(
                                (pwModelErr) => {
                                    return res.json({status: false, message: 'please contact developer with error code 2002. '}).status(400);
                                }
                            )
                    } else {
                        return res.json({status: false, message: 'incorrect password'}).status(404);
                    }
                }
            )
            .catch(
                (modelErr) => {
                    return res.json({status: false, message: 'please contact developer with error code 2003. '}).status(400);
                }
            );
    }




};
