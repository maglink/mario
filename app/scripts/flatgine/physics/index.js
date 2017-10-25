module.exports = function(world) {
    var _self = this;

    _self.world = world;

    _self.gravity = 5;
    _self.timeFrequency = 1000/30;
    _self.timeRate = 1;
    _self.defaultBounce = 0.02;
    _self.defaultFriction = 0.1;

    _self.setTimeFrequency = function(frequency) {
        _self.timeFrequency = frequency;
    };

    _self.getPieceOfTime = function(){
        return 1000/_self.timeFrequency/_self.timeRate;
    };

    _self.update = function () {
        var bodies = _self.world.bodies;
        Object.keys(bodies).forEach(function (id) {
            var body = bodies[id].physics;

            if(body.isStatic) {
                return;
            }

            body.vy += -_self.gravity/_self.getPieceOfTime();

            var dx = body.vx/_self.getPieceOfTime();
            var dy = body.vy/_self.getPieceOfTime();

            var maxD = 0.49999999;

            if(dx > maxD) dx = maxD;
            if(dx < -maxD) dx = -maxD;
            if(dy > maxD) dy = maxD;
            if(dy < -maxD) dy = -maxD;

            body.dx = dx;
            body.dy = dy;

            body.x += body.dx;
            var collision = _self.checkGridCollisions(body);
            if(collision) {
                _self.resolveGridCollision(body, collision, 'x');
            }

            body.y += body.dy;
            collision = _self.checkGridCollisions(body);
            if(collision) {
                _self.resolveGridCollision(body, collision, 'y');
            }
        })
    };

    _self.resolveGridCollision = function (body, collision, axis) {
        var cellBody = {
            x: collision.j,
            y: -collision.i,
            width: 1,
            height: 1
        };
        var cellCenter = {
            x: cellBody.x+cellBody.width/2,
            y: cellBody.y-cellBody.height/2
        };
        var bodyCenter = {
            x: body.x+body.width/2,
            y: body.y-body.height/2
        };

        var gap = 0.000000000001;

        if(axis === 'x') {
            if(bodyCenter.x < cellCenter.x) {
                body.x = cellBody.x - body.width - gap;
            } else {
                body.x = cellBody.x + cellBody.width + gap;
            }
            body.vy *= 1 - _self.getFriction(body, cellBody);
            body.vx *= -1 * _self.getBounce(body, cellBody);
            body.vx = Math.floor(Math.abs(body.vx)) === 0 ? 0 : body.vx;
        }

        if(axis === 'y') {
            if(bodyCenter.y > cellCenter.y) {
                body.y = cellBody.y + body.height + gap;
            } else {
                body.y = cellBody.y - cellBody.height - gap;
            }
            body.vx *= 1 - _self.getFriction(body, cellBody);
            body.vy *= -1 * _self.getBounce(body, cellBody);
            body.vy = Math.floor(Math.abs(body.vy)) === 0 ? 0 : body.vy;
        }
    };

    _self.getBounce = function(body, other) {
        var bounce = _self.defaultBounce;
        if(body.bounce && other.bounce) {
            bounce = body.bounce > other.bounce ? body.bounce : other.bounce;
        } else {
            bounce = body.bounce ? body.bounce : bounce;
            bounce = other.bounce ? other.bounce : bounce;
        }
        return bounce
    };

    _self.getFriction = function(body, other) {
        var friction = _self.defaultFriction;
        if(body.friction && other.friction) {
            friction = body.friction > other.friction ? body.friction : other.friction;
        } else {
            friction = body.friction ? body.friction : friction;
            friction = other.friction ? other.friction : friction;
        }
        return friction
    };

    _self.checkGridCollisions = function (body) {
        var map = _self.world.map;

        var startI = Math.floor(-1 * body.y);
        var endI = Math.floor(-1 * (body.y - body.height));

        var startJ = Math.floor(body.x);
        var endJ = Math.floor(body.x+body.width);

        if(endJ < 0 || endI < 0 || startI > map.grid.length-1 || startJ > map.grid[0].length-1) {
            return;
        }

        startI = startI < 0 ? 0 : startI;
        startJ = startJ < 0 ? 0 : startJ;
        endI = endI > map.grid.length-1 ? map.grid.length-1 : endI;
        endJ = endJ > map.grid[0].length-1 ? map.grid[0].length-1 : endJ;

        for(var i = startI;i <= endI; i++){
            for(var j = startJ;j <= endJ; j++){
                var cell = map.grid[i][j];
                if(cell) return {
                    i: i,
                    j: j,
                    cell: cell
                };
            }
        }

        return null
    };

    return _self;
};