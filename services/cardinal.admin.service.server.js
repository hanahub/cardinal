module.exports = function (app, models) {

    const userModel = models.userModel;
    const bcrypt = require("bcrypt-nodejs");

    const access_denied = "Access denied. ";

    app.post('/api/admin/:adminId/user', adminRegister);
    app.get('/api/admin/:userId/users', returnAllUsers);
    app.get('/api/admin/:adminId/uuid', getUUID);

    app.put('/api/admin/:adminId/user/:username', clearLoginFailure);

    app.patch('/api/admin/:adminId/user/:userId', resetUser);

    app.delete('/api/admin/:adminId/user/:userId', deleteUser);

    function deleteUser(request, response) {
        let userId = request.params.userId;
        let adminId = request.params.adminId;

        const success_msg = 'You successfully removed a user. ';
        const error_msg = 'An error occurred while removing a user. ';

        (async() => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                userModel
                    .removeUser(userId)
                    .then(
                        modelRes => {
                            return response.json({ status: true, message: success_msg }).status(200);
                        }
                    )
                    .catch(
                        error => {
                            return response.json({ status: false, message: error_msg }).status(400);
                        }
                    )
            } else {
                return response.send(access_denied);
            }
        })().catch(e => setImmediate(() => { response.send(e) }));
    }

    function clearLoginFailure(req, res) {
        let username = req.params.username;
        let adminId = req.params.adminId;

        const success_msg = "You successfully cleared a user's login failure. ";
        const error_msg = "An error occurred while clearing a user's login failure. ";

        (async() => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                userModel
                    .setLoginFailure(username, 0)
                    .then(
                        modelRes => {
                            return res.json({ status: true, message: success_msg }).status(200);
                        }
                    )
                    .catch(
                        error => {
                            return res.json({ status: false, message: error_msg }).status(400);
                        }
                    )
            } else {
                return res.send(access_denied);
            }
        })().catch(e => setImmediate(() => { res.send(e) }));
    }

    function getUUID(request, response) {
        let adminId = request.params.adminId;

        const error_msg = 'An error occurred while generating a UUID. ';

        (async () => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                userModel
                    .generateUUID()
                    .then(
                        modelRes => {
                            let userId = modelRes.rows[0].uuid;
                            userModel
                                .getUserByUserId(userId)
                                .then(
                                    getUserRes => {
                                        if(getUserRes.rowCount > 0) {
                                            userModel
                                                .generateUUID()
                                                .then(
                                                    newUUIDRes => {
                                                        return response.json({ status: true, uuid: newUUIDRes.rows[0].uuid }).status(200);
                                                    }
                                                )
                                                .catch(
                                                    error => {
                                                        return response.json({ status: false, message: error_msg }).status(400);
                                                    }
                                                )
                                        } else {
                                            return response.json({ status: true, uuid: userId }).status(200);
                                        }
                                    }
                                )
                                .catch(
                                    error => {
                                        return response.json({ status: false, message: error_msg }).status(400);
                                    }
                                )
                        }
                    )
                    .catch(
                        error => {
                            return response.json({ status: false, message: error_msg }).status(400);
                        }
                    )
            } else {
                return response.send(access_denied);
            }
        })().catch(e => setImmediate(() => {response.send(e)}));
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

    function adminRegister(request, response) {
        let userId = request.body.data.user_id;
        let username = request.body.data.username;
        let newUserType = parseInt(request.body.data.user_type);
        const new_password  = request.body.data.password;
        const new_password_hashed  = bcrypt.hashSync(new_password);
        let email = request.body.data.email;
        let adminId = request.params.adminId;

        const invalid_inv_msg = 'The invitation code you entered is invalid. ';
        const username_alphanumeric_msg = 'Username should be alphanumeric and not empty. ';
        const pw_alphanumeric_msg = 'Password should be alphanumeric and at least 6-character long. ';
        const email_empty_msg = 'Email should not be empty. ';

        if (!checkInvCode(userId) || userId.split('-').length !== 5) {
            return response.json({status: false, message: invalid_inv_msg}).status(400);
        }
        if (!checkAlphanumeric(username)) {
            return response.json({status: false, message: username_alphanumeric_msg }).status(400);
        }
        if (!checkAlphanumeric(new_password) || new_password.length < 6) {
            return response.json({status: false, message: pw_alphanumeric_msg }).status(400);
        }
        if (!email) {return response.json({status: false, message: email_empty_msg}).status(400);}

        (async () => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            const success_msg = 'You successfully created a new user. ';
            const duplicated_msg = 'That User Id is already in use. ';
            const duplicated_username_msg = 'That username is already in use. ';

            if(userType === -1) {
                userModel
                    .findUserByUsername(username)
                    .then(
                        (modelRes) => {
                            if (modelRes.rowCount > 0) {
                                return response.json({status: false, message: duplicated_username_msg }).status(400);
                            } else {
                                userModel
                                    .newUser(userId, username, new_password_hashed, newUserType, email)
                                    .then(
                                        regRes => {
                                            return response.json({ status: true, message: success_msg }).status(200);
                                        })
                                    .catch(
                                        err => {
                                            return response.json({status: false, message: duplicated_msg }).status(400);
                                        })
                            }

                        }
                    )
                    .catch(err => {
                        return response.json({status: false, message: 'Please contact developer with error code 1004.' }).status(400);
                    })
            } else {
                return response.send(access_denied);
            }
        })().catch(e => setImmediate(() => { response.send(e) }));

    }

    function returnAllUsers(request, response) {
        let userId = request.params.userId;

        (async () => {
            const user = await userModel.findUserType(userId);
            const userType = user.rows[0].user_type;

            const error_msg = 'An error occurred while trying to retrieve all users. ';

            if(userType === -1) {
                userModel
                    .findAllUsers()
                    .then(
                        modelRes => {
                            return response.json({ status: true, users: modelRes.rows }).status(200)
                        }
                    )
                    .catch(
                        error => {
                            return response.json({ status: false, message: error_msg }).status(400)
                        }
                    )
            } else {
                return response.send(access_denied);
            }

        })().catch(e => setImmediate(() => { response.send(e) }));
    }

    function resetUser(request, response) {
        let userId = request.params.userId;
        let username = request.body.data.username;
        let email = request.body.data.email;
        let password = bcrypt.hashSync(request.body.data.password);
        let adminId = request.params.adminId;

        const success_msg = 'You successfully reset a users credentials.';

        (async() => {
            const user = await userModel.findUserType(adminId);
            const userType = user.rows[0].user_type;

            if(userType === -1) {
                userModel
                    .resetUserCredentials(username, email, password, userId)
                    .then(
                        modelRes => {
                            return response.json({ status: true, message: success_msg }).status(200)
                        }
                    )
                    .catch(
                        error => {
                            return response.json({ status: false, message: `Error: ${error.detail}` }).status(400)
                        }
                    )
            } else {
                return response.send(access_denied);
            }
        })().catch(e => setImmediate(() => {response.send(e)}));
    }


};