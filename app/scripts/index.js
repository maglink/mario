var $ = require('jquery');
var Flatgine = require('./flatgine');
var Char = require('./char.js');

var canvasElement = $('#canvas').get(0);
function onResize() {
    canvasElement.width  = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
$(window).resize(onResize);
onResize();

var game = new Flatgine(canvasElement);
game.Run(1000/30);
var char = new Char(game);

$.getJSON( "files/maps/map1.json", function(data) {
    game.world.LoadMap(data, 'files/maps/');

    var zoom = (game.renderer.ctx.canvas.height/game.world.map.tileheight)/14;
    game.renderer.camera.SetZoom(zoom);

    char.CreateBody();
    game.world.SetBodyPositionByZone(char.body, "player");

    game.renderer.camera.SetPositionByBody(char.body);
    game.renderer.camera.Follow(char.body, false, {y:5});
    game.renderer.BeforeRender(function () {
        game.renderer.camera.y = -10.5;

        var leftEdge = (game.renderer.ctx.canvas.width/game.world.map.tilewidth/zoom)/2 + 1;
        if(game.renderer.camera.x < leftEdge) {
            game.renderer.camera.x = leftEdge;
        }
    });

    var questionBlockImage = new game.renderer.animation({
        imagesCount: 3,
        imageUrl: function(i) {
            return "files/question_block/20" +(i+1)+ ".png"
        },
        playMode: 'ping-pong',
        playSpeed: 1000/10,
        pauseBetweenLoops: 300
    });
    questionBlockImage.Play();

    game.world.GetGridBlocksByType('question_block').forEach(function (block) {
        block.image = questionBlockImage;
    })
});