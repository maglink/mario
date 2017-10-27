module.exports = function(world) {
    var _self = this;

    _self.world = world;

    _self.gravity = 9.8;
    _self.timeFrequency = 1000/30;
    _self.timeRate = 1;
    _self.defaultBounce = 0.02;
    _self.defaultFriction = 0.1;
    _self.defaultDensity = 1;

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

            var oldCoords = {
                x: body.x,
                y: body.y
            };

            if(!body.sleep) {
                body.density = body.density ? body.density : _self.defaultDensity;
                body.vy += -(_self.gravity*body.density)/_self.getPieceOfTime();
            }

            if(body.vx || body.vy) {
                var dx = body.vx/_self.getPieceOfTime();
                var dy = body.vy/_self.getPieceOfTime();

                var maxD = 0.49999999;

                if(dx > maxD) dx = maxD;
                if(dx < -maxD) dx = -maxD;
                if(dy > maxD) dy = maxD;
                if(dy < -maxD) dy = -maxD;

                var collision;

                body.x += dx;
                _self.checkCollisions(body, 'x');
                collision = _self.checkGridCollisions(body);
                if(collision) {
                    _self.resolveGridCollision(body, collision, 'x');
                }

                body.y += dy;
                _self.checkCollisions(body, 'y');
                collision = _self.checkGridCollisions(body);
                if(collision) {
                    _self.resolveGridCollision(body, collision, 'y');
                }

                body.sleep = oldCoords.x === body.x && oldCoords.y === body.y;
            }
        })
    };

    _self.checkCollisions = function(body, axis) {
        var bodies = _self.world.bodies;
        Object.keys(bodies).forEach(function (id) {
            var other = bodies[id].physics;
            if(other === body) {
                return;
            }

            if(_self.isCollision(body, other)) {
                _self.resolveCollision(body, other, axis)
            }
        });
        return null;
    };

    _self.resolveCollision = function (body, other, axis) {
        var bodyCenter = {
            x: body.x+body.width/2,
            y: body.y-body.height/2
        };
        var otherCenter = {
            x: other.x+other.width/2,
            y: other.y-other.height/2
        };

        var gap = 0.00000000001;

        body.density = body.density ? body.density : _self.defaultDensity;
        other.density = other.density ? other.density : _self.defaultDensity;
        body.mass = body.width * body.height * body.density;
        other.mass = other.width * other.height * other.density;

        if(axis === 'x') {
            if(bodyCenter.x < otherCenter.x) {
                body.x = other.x - body.width - gap;
            } else {
                body.x = other.x + other.width + gap;
            }

            body.vx *= body.mass/(body.mass + other.mass);
            other.vx *= other.mass/(body.mass + other.mass);

            var resultVX = other.vx + body.vx;
            body.vx = resultVX;
            other.vx = resultVX;
            body.vx = Math.floor(Math.abs(body.vx)*100) === 0 ? 0 : body.vx;
            other.vx = Math.floor(Math.abs(other.vx)*100) === 0 ? 0 : other.vx;

            body.vy *= 1 - _self.getFriction(body, other);
            body.vy *= 1 - _self.getFriction(body, other);
        }

        if(axis === 'y') {
            if (bodyCenter.y > otherCenter.y) {
                body.y = other.y + body.height + gap;
            } else {
                body.y = other.y - other.height - gap;
            }

            body.vy *= body.mass/(body.mass + other.mass);
            other.vy *= other.mass/(body.mass + other.mass);

            var resultVY = other.vy + body.vy;
            body.vy = resultVY;
            other.vy = resultVY;
            body.vy = Math.floor(Math.abs(body.vy)*100) === 0 ? 0 : body.vy;
            other.vy = Math.floor(Math.abs(other.vy)*100) === 0 ? 0 : other.vy;

            body.vx *= 1 - _self.getFriction(body, other);
            body.vx *= 1 - _self.getFriction(body, other);
        }
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

        var gap = 0.00000000001;

        if(axis === 'x') {
            if(bodyCenter.x < cellCenter.x) {
                body.x = cellBody.x - body.width - gap;
            } else {
                body.x = cellBody.x + cellBody.width + gap;
            }
            body.vy *= 1 - _self.getFriction(body, cellBody);
            body.vx *= -1 * _self.getBounce(body, cellBody);
            body.vx = Math.floor(Math.abs(body.vx)*100) === 0 ? 0 : body.vx;
        }

        if(axis === 'y') {
            if(bodyCenter.y > cellCenter.y) {
                body.y = cellBody.y + body.height + gap;
            } else {
                body.y = cellBody.y - cellBody.height - gap;
            }
            body.vx *= 1 - _self.getFriction(body, cellBody);
            body.vy *= -1 * _self.getBounce(body, cellBody);
            body.vy = Math.floor(Math.abs(body.vy)*100) === 0 ? 0 : body.vy;
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

    _self.isCollision = function(object1, object2) {
        _self.calcCenterAndHalfSize(object1);
        _self.calcCenterAndHalfSize(object2);
        if ( Math.abs(object1.center.x - object2.center.x) > object1.halfSize.x + object2.halfSize.x ) return false;
        if ( Math.abs(object1.center.y - object2.center.y) > object1.halfSize.y + object2.halfSize.y ) return false;
        return true;
    };

    _self.calcCenterAndHalfSize = function (body) {
        body.halfSize = {
            x: body.width/2,
            y: body.height/2
        };
        body.center = {
            x: body.x + body.halfSize.x,
            y: body.y - body.halfSize.y
        };
    };


    return _self;
};