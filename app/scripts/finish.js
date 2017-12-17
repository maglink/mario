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
            oneTouch = true;
            var points = 5000;
            var level = char.body.physics.y-char.body.physics.height - finishFlag.physics.y;
            if(level<0) {
                level*=-1;
                points-=points*(level/9)
            }
            points = Math.round(points);


            finishFlag.physics.isStatic = false;
            char.finish()
        }
        if(zone.name === "exit") {
            setTimeout(function(){
                game.world.RemoveBody(char.body)
                alert("finish")
            }, 1000/2.1)
        }
    });
};