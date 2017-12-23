var $ = require('jquery');

module.exports.points = function(game) {
    game.points = 0;
    $("#points").text(pad(game.points, 6));


    game.addGamePoints = function(count) {
        game.points += count;
        $("#points").text(pad(game.points, 6));


        if(game.char) {

            var pointLabel = game.world.AddBody({
                isStatic: true,
                noCollideObjects: true,
                x: game.char.body.physics.x + game.char.body.physics.width/2,
                y: game.char.body.physics.y - game.char.body.physics.height/2
            });

            pointLabel.renderer.label = {
                font: "20px emulogic",
                fillStyle: "white",
                text: count
            };

            setTimeout(function () {
                game.world.RemoveBody(pointLabel);
            }, 1500)
        }
    };


};


module.exports.lifes = function(game) {
    game.charlifes = 3;
    $("#lifes").text(pad(game.charlifes, 2));
    game.AddLife = function() {
        game.charlifes++;
        $("#lifes").text(pad(game.charlifes, 2));
    };
    game.RemoveLife = function() {
        game.charlifes--;
        $("#lifes").text(pad(game.charlifes, 2));
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

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}