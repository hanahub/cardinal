module.exports = function(app) {

    //TODO
    //require models
    let models = require("./models/cardinal.platform.models.server")();


    //TODO
    //require server-side service APIs, register express app and models
    require("./services/cardinal.user.service.server.js")(app, models);
    require("./services/cardinal.admin.service.server.js")(app, models);
    require("./services/cardinal.team.service.server.js")(app, models);
    require("./services/cardinal.player.service.server.js")(app, models);
    require("./services/cardinal.analysis.service.server.js")(app, models);


};