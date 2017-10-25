var $ = require('jquery');
var Flatgine = require('./flatgine');

var canvasElement = $('#canvas').get(0);
function onResize() {
    canvasElement.width  = window.innerWidth;
    canvasElement.height = window.innerHeight;
}
$(window).resize(onResize);
onResize();

var game = new Flatgine(canvasElement);
game.Run(1000/30);

$.getJSON( "files/maps/map1.json", function(data) {
    game.world.LoadMap(data, 'files/maps/');
    game.renderer.camera.SetZoom(0.7);

    var char = game.world.AddBody({
        x: 11,
        y: -7,
        width: 0.9999999,
        height: 1.5
    });

    game.renderer.camera.Follow(char);

    //char.physics.vx = 5 - Math.random() * 10;
    //char.physics.vy = 5 - Math.random() * 10;

    //char.physics.vx = 0.1;
    //char.physics.vy = -3;

    setInterval(function(){
        char.physics.vx = 10 - Math.random() * 20;
        char.physics.vy = 10 - Math.random() * 20;
    }, 500 + Math.random()*200)
});