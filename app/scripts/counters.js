var $ = require('jquery');

module.exports.points = function(game) {
    game.points = 0;
    $("#points").text(game.points);
    game.addGamePoints = function(count) {
        game.points += count;
        $("#points").text(game.points);
    }
};


module.exports.lifes = function(game) {
    game.charlifes = 3;
    $("#lifes").text(game.charlifes);
    game.AddLife = function() {
        game.charlifes++;
        $("#lifes").text(game.charlifes);
    };
    game.RemoveLife = function() {
        game.charlifes--;
        $("#lifes").text(game.charlifes);
    };
};

module.exports.timeleft = function(game) {
    game.timeleft=400;
    $("#timeleft").text(game.timeleft);
    game.UpdateTimeleft = function(timeleft) {
        game.timeleft = timeleft;
        $("#timeleft").text(game.timeleft);
    }
};