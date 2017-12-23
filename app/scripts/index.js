var $ = require('jquery');
var async = require('async');
var Flatgine = require('./flatgine');
var Char = require('./char.js');
var Blocks = require('./blocks.js');
var Sounds = require('./sounds.js');
var Enemies = require('./enemies.js');
var Finish = require('./finish.js');
var Counters = require('./counters.js');
var Sources = require('./sources.js');

var canvasElement = $('#canvas').get(0);

var game = new Flatgine(canvasElement);
game.physics.gravity = 9.8*4;
var mapData;

function LoadSources(cb) {
    Sources.setProgress(0);

    async.series([
        function(cb) {
            $.getJSON( "files/maps/map1.json", function(data) {
                mapData = data;
                Sources.setProgress(10);
                cb();
            })
        },
        function (cb) {
            Sources.loadFiles(cb)
        }
    ], cb);
}

LoadSources(function () {
    Sources.setProgress(100);
    $("#loader").hide();
    game.Run(1000/30);

    Sounds.LoadSounds(game);
    Sounds.LoadSoundsSettings(game);

    Counters.timeleft(game);
    Counters.points(game);
    Counters.lifes(game);
    Counters.coins(game);

    game.renderer.BeforeRender(function () {

        var zoom = game.renderer.camera.zoomRate;

        if(game.char.inBackground) {
            game.renderer.camera.x = 65;
            game.renderer.camera.y = -27.5;
        } else {
            game.renderer.camera.y = -10.5;

            var leftEdge = (game.renderer.ctx.canvas.width/game.world.map.tilewidth/zoom)/2 + 1;
            if(game.renderer.camera.x < leftEdge) {
                game.renderer.camera.x = leftEdge;
            }

            var rightEdge = game.world.map.grid[0].length - (game.renderer.ctx.canvas.width/game.world.map.tilewidth/zoom)/2 - 1;
            if(game.renderer.camera.x > rightEdge) {
                game.renderer.camera.x = rightEdge;
            }

            if(!game.renderer.camera.cameraMaxPos) {
                game.renderer.camera.cameraMaxPos = game.renderer.camera.x;
            }
            if(game.renderer.camera.cameraMaxPos > game.renderer.camera.x) {
                game.renderer.camera.x = game.renderer.camera.cameraMaxPos;
            }
            game.renderer.camera.cameraMaxPos = game.renderer.camera.x;
        }

    });

    game.firstTapEvent = function(){
        $("#keyboard").fadeOut(500)
    };

    function onResize() {
        canvasElement.width  = window.innerWidth;
        canvasElement.height = window.innerHeight;

        if(game.world.map) {
            var zoom = (game.renderer.ctx.canvas.height/game.world.map.tileheight)/14;
            game.renderer.camera.SetZoom(zoom);
        }
    }
    $(window).resize(onResize);
    onResize();

    LoadLevel();
});

function LoadLevel() {
    game.world.LoadMap(mapData, 'files/maps/');
    Blocks.QuestionBlock(game);
    Blocks.BreakableWall(game);
    Blocks.Coin(game);
    Blocks.Multicoin(game);
    Blocks.Star(game);

    var char = new Char(game, function(){
        game.RemoveLife();
        if(game.charlifes > 0 && game.timeleft > 0) {
            $("#die_screen").fadeIn();
        }
        setTimeout(function () {
            if(game.charlifes > 0 && game.timeleft > 0) {
                $("#die_screen").fadeOut();
                LoadLevel();
            } else {
                game.sounds.StopBackground();
                game.sounds.Play("gameover");
                $("#gameover").fadeIn();
            }
        }, 2000);
    });
    game.char = char;
    char.CreateBody();
    if(game.isCheckpoint) {
        game.world.SetBodyPositionByZone(char.body, "checkpoint1");
    } else {
        game.world.SetBodyPositionByZone(char.body, "player");
    }

    game.renderer.camera.cameraMaxPos = null;
    game.renderer.camera.SetPositionByBody(char.body);
    game.renderer.camera.Follow(char.body, false, {y:5});
    var zoom = (game.renderer.ctx.canvas.height/game.world.map.tileheight)/14;
    game.renderer.camera.SetZoom(zoom);

    Enemies.AddEnimies(game, char);
    Finish.AddFinishFlag(game, char);

    game.sounds.PlayBackground('main_theme');
}
