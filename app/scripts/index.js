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
    game.renderer.camera.SetZoom(3);

    var char = game.world.AddBody();
    game.world.SetBodyPositionByZone(char, "player");

    game.renderer.camera.SetPositionByBody(char);
    game.renderer.camera.Follow(char);

});