var $ = require('jquery');
var async = require('async');

module.exports.AddFinishFlag = function(game, char) {

    var flagImage = game.renderer.LoadImage("files/flag/80.png");

    var finishFlag = game.world.AddBody({
        type: 'finishFlag',
        image: flagImage,
        isStatic: true,
        noCollideObjects: true
    });
    game.world.SetBodyPositionByZone(finishFlag, "finish_flag");


    var oneTouch = false;

    game.world.AddBodyEventListener(char.body, 'onZoneIn', function (zone) {
        if(zone.name === "finish" && !oneTouch) {
            game.sounds.StopBackground();
            game.sounds.Play('flag');
            setTimeout(function () {
                game.sounds.Play('level_complete');
            }, 1500);
            oneTouch = true;
            var points = 5000;
            var level = char.body.physics.y-char.body.physics.height - finishFlag.physics.y;
            if(level<0) {
                level*=-1;
                points-=points*(level/9)
            }
            points = Math.round(points);

            game.addGamePoints(points);

            finishFlag.physics.isStatic = false;
            char.finish()
        }
        if(zone.name === "exit") {
            setTimeout(function(){
                game.world.RemoveBody(char.body);
                game.timeleft=100
                var list = [];
                for(var i=0;i<game.timeleft;i++) {
                    list.push({})
                }

                var pointsCalcInterval = setInterval(function () {
                    game.sounds.Play('beep');
                }, 90);

                async.eachSeries(list, function (item, cb) {
                    game.addGamePoints(50);
                    game.UpdateTimeleft(--game.timeleft);
                    setTimeout(function () {
                        cb();
                    }, 20);
                }, function() {
                    clearInterval(pointsCalcInterval);
                    $("#finish_score").text(game.points);
                    $("#finish").fadeIn();

                    var saluteInterval = setInterval(function () {
                        launchSalute(game);
                    }, 705);
                })

            }, 1000/2.1)
        }
    });
};

var lastSalutePoint;
var salutePointsList = [
    {x: 206, y: -9},
    {x: 207, y: -10},
    {x: 204, y: -8},
    {x: 201, y: -9},
    {x: 203, y: -9},
    {x: 202, y: -8},
    {x: 204, y: -8},
    {x: 205, y: -8},
    {x: 201, y: -10},
    {x: 207, y: -9}
];


function launchSalute(game) {
    var points = [];
    for(var i=0;i<salutePointsList.length;i++) {
        if(lastSalutePoint !== salutePointsList[i]) {
            points.push(salutePointsList[i])
        }
    }

    var point = points[Math.floor(Math.random()*points.length)];
    lastSalutePoint = point;

    var boom = game.world.AddBody({
        isStatic: true,
        noCollideObjects: true,
        x: point.x + Math.random()-0.5,
        y: point.y + Math.random()-0.5,
        image: new game.renderer.animation({
            imagesCount: 3,
            imageUrl: function(i) {
                return 'files/bullet/bullet-blow'+(i+1)+".png"
            },
            playSpeed: 1000/2,
            noLoop: true
        }).Play()
    });
    setTimeout(function () {
        game.world.RemoveBody(boom)
    }, (1000/2)*3);
}