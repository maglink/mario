var Camera = require('./camera');

module.exports = function(ctx, world) {
    var _self = this;

    _self.ctx = ctx;
    _self.world = world;
    _self.camera = new Camera();

    _self.isDebug = true;

    _self.textures = {};

    _self.LoadImage = function (imageUrl) {
        _self.getTexture(imageUrl);
    };

    _self.getTexture = function(path) {
        if(_self.textures[path]) {
            return _self.textures[path]
        }
        var img = new Image();
        img.src = path;
        _self.textures[path] = img;
        return img
    };

    _self.update = function () {
        _self.camera.update();
        _self.ctx.clearRect(0, 0, _self.ctx.canvas.width, _self.ctx.canvas.height);
        _self.drawGrid();
        _self.drawBodies();
    };

    _self.drawBodies = function () {
        var map = _self.world.map;
        var bodies = _self.world.bodies;

        Object.keys(bodies).forEach(function (id) {
            var body = bodies[id];

            var x = _self.ctx.canvas.width/2 + (body.physics.x - _self.camera.x) * _self.camera.zoomRate * map.tilewidth;
            var y = _self.ctx.canvas.height/2 - (body.physics.y - _self.camera.y) * _self.camera.zoomRate * map.tileheight;
            var width = body.physics.width * map.tilewidth * _self.camera.zoomRate;
            var height = body.physics.height * map.tileheight * _self.camera.zoomRate;

            _self.ctx.beginPath();
            _self.ctx.rect(x, y, width, height);
            _self.ctx.fillStyle = body.renderer.color || "#5574ff";
            _self.ctx.fill();
            _self.ctx.closePath();

            if(_self.isDebug) {
                var centerX = x+width/2;
                var centerY = y+height/2;

                _self.ctx.beginPath();
                _self.ctx.moveTo(centerX,centerY);
                _self.ctx.lineTo(centerX,centerY - body.physics.vy*map.tileheight*_self.camera.zoomRate);
                _self.ctx.lineWidth = 2;
                _self.ctx.strokeStyle = '#ff0000';
                _self.ctx.stroke();


                _self.ctx.beginPath();
                _self.ctx.moveTo(centerX,centerY);
                _self.ctx.lineTo(centerX + body.physics.vx*map.tilewidth*_self.camera.zoomRate,centerY);
                _self.ctx.lineWidth = 2;
                _self.ctx.strokeStyle = '#00ff00';
                _self.ctx.stroke();
            }
        })
    };

    _self.drawGrid = function () {
        var map = _self.world.map;

        var startJ = Math.floor(_self.camera.x - _self.ctx.canvas.width/2/_self.camera.zoomRate/map.tilewidth);
        var endJ = Math.ceil(_self.camera.x + _self.ctx.canvas.width/2/_self.camera.zoomRate/map.tilewidth);

        var startI = Math.floor(-1 *(_self.camera.y + _self.ctx.canvas.height/2/_self.camera.zoomRate/map.tileheight));
        var endI = Math.ceil(-1 *(_self.camera.y - _self.ctx.canvas.height/2/_self.camera.zoomRate/map.tileheight));

        if(startI < 0) {
            startI = 0
        }
        if(startJ < 0) {
            startJ = 0
        }
        if(endI > map.grid.length) {
            endI = map.grid.length
        }

        for(var i=startI;i<endI;i++){
            if(endJ > map.grid[i].length) {
                endJ = map.grid[i].length
            }
            for(var j=startJ;j<endJ;j++){
                var cell = map.grid[i][j];
                if(!cell || !cell.image) {
                    continue
                }

                var texture = _self.getTexture(cell.image);
                var x = j*map.tilewidth;
                var y = -1*i*map.tileheight;

                _self.ctx.drawImage(
                    texture,
                    _self.ctx.canvas.width/2 + (x - _self.camera.x*map.tilewidth) * _self.camera.zoomRate,
                    _self.ctx.canvas.height/2 - (y - _self.camera.y*map.tileheight) * _self.camera.zoomRate,
                    map.tilewidth * _self.camera.zoomRate,
                    map.tileheight * _self.camera.zoomRate
                );

                if(_self.isDebug) {
                    _self.ctx.font = "10px Comic Sans MS";
                    _self.ctx.fillStyle = "black";
                    _self.ctx.textAlign = "center";
                    _self.ctx.fillText("(" + i + "," + j + ")",
                        _self.ctx.canvas.width/2 + (x - _self.camera.x*map.tilewidth) * _self.camera.zoomRate + map.tilewidth * _self.camera.zoomRate/2,
                        _self.ctx.canvas.height/2 - (y - _self.camera.y*map.tileheight) * _self.camera.zoomRate + map.tileheight * _self.camera.zoomRate/2
                    );
                }
            }
        }
    };

    return _self;
};