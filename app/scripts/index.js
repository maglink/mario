var $ = require('jquery');
var Flatgine = require('./flatgine');
var Char = require('./char.js');
var Blocks = require('./blocks.js');
var Sounds = require('./sounds.js');
var Enemies = require('./enemies.js');
var Finish = require('./finish.js');
var Counters = require('./counters.js');

var canvasElement = $('#canvas').get(0);

var game = new Flatgine(canvasElement);
game.physics.gravity = 9.8*4;
game.Run(1000/30);
LoadGame();
var zoom;

Counters.points(game);
Counters.lifes(game);
Counters.timeleft(game);

function LoadGame() {
    $.getJSON( "files/maps/map1.json", function(data) {

        game.world.LoadMap(data, 'files/maps/');

        //char
        var char = new Char(game, function(){
            game.RemoveLife();
            if(game.charlifes > 1) {
                LoadGame();
            } else {
                //todo: end of game
            }
        });
        char.CreateBody();
        game.world.SetBodyPositionByZone(char.body, "player");

        //camera
        zoom = (game.renderer.ctx.canvas.height/game.world.map.tileheight)/14;
        game.renderer.camera.SetZoom(zoom);
        game.renderer.camera.SetPositionByBody(char.body);
        game.renderer.camera.Follow(char.body, false, {y:5});
        game.renderer.BeforeRender(function () {

            if(char.inBackground) {
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
            }
        });

        //-----

        Sounds(game);
        Blocks.QuestionBlock(game);
        Blocks.BreakableWall(game);
        Blocks.Coin(game);
        Blocks.Multicoin(game);
        Blocks.Star(game);
        Enemies.AddEnimies(game, char);
        Finish.AddFinishFlag(game, char);

    });
}


function onResize() {
    canvasElement.width  = window.innerWidth;
    canvasElement.height = window.innerHeight;

    if(game.world.map) {
        zoom = (game.renderer.ctx.canvas.height/game.world.map.tileheight)/14;
        game.renderer.camera.SetZoom(zoom);
    }
}
$(window).resize(onResize);
onResize();