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

            _self.setBodyDeltaChange(body);

            body.x += body.dx;
            body.y += body.dy;


            _self.checkBodyCollisions(body);
        })
    };

    _self.setBodyDeltaChange = function(body){
        var dx = body.vx/_self.getPieceOfTime();
        var dy = body.vy/_self.getPieceOfTime();

        var maxD = 0.49999999;

        if(dx > maxD) dx = maxD;
        if(dx < -maxD) dx = -maxD;
        if(dy > maxD) dy = maxD;
        if(dy < -maxD) dy = -maxD;

        body.dx = dx;
        body.dy = dy;
    };

    _self.checkBodyCollisions = function(body){
        var result;
        var count = 0;
        while(count++ < 5) {
            result = _self.checkGridCollisions(body);
            if (result && result.length) {
                var item = result[0];
                _self.resolveCollisionWithGrid(body, item.i, item.j);
            } else {
                break;
            }
        }
    };

    _self.resolveCollisionWithGrid = function(body, i, j) {
        var cellBody = {
            isStatic: true,
            x: j,
            y: -i,
            width: 1,
            height: 1
        };
        _self.resolveCollision(body, cellBody)
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

    _self.changeX = function(body, other) {
        var oldX = body.x - body.dx;
        var beforeS;
        var afterS;
        if(body.x+body.width < other.x+other.width/2) {
            beforeS = (other.x - (oldX + body.width));
            afterS = (other.x - (body.x + body.width));
        } else if(body.x > other.x+other.width/2) {
            beforeS = (oldX - (other.x+other.width));
            afterS = (body.x - (other.x+other.width));
        }
        var changeS = beforeS - afterS;
        if(changeS) {
            var wrongPiece = ((changeS - beforeS) / changeS) + 0.000000000001;

            body.x = body.x - body.dx * wrongPiece;
            body.y = body.y - body.dy * wrongPiece;

            body.vy *= 1 - _self.getFriction(body, other);
            body.vx *= -1 * _self.getBounce(body, other);
            body.vx = Math.floor(Math.abs(body.vx)) === 0 ? 0 : body.vx;
            _self.setBodyDeltaChange(body);

            body.dx *= wrongPiece;
            body.dy *= wrongPiece;

            body.x += body.dx;
            body.y += body.dy;
        }
    };

    _self.changeY = function(body, other) {
        var oldY = body.y - body.dy;
        var beforeS;
        var afterS;
        if(body.y-body.height > other.y-other.height/2) {
            beforeS = ((oldY - body.height) - other.y);
            afterS = ((body.y - body.height) - other.y);
        } else if(body.y < other.y-other.height/2) {
            beforeS = (other.y - other.height - oldY);
            afterS = (other.y - other.height - body.y);
        }
        var changeS = beforeS - afterS;
        if(changeS) {
            var wrongPiece = ((changeS - beforeS) / changeS) + 0.000000000001;

            body.x = body.x - body.dx * wrongPiece;
            body.y = body.y - body.dy * wrongPiece;

            body.vx *= 1 - _self.getFriction(body, other);
            body.vy *= -1 * _self.getBounce(body, other);
            body.vy = Math.floor(Math.abs(body.vy)) === 0 ? 0 : body.vy;
            _self.setBodyDeltaChange(body);

            body.dx *= wrongPiece;
            body.dy *= wrongPiece;

            body.x += body.dx;
            body.y += body.dy;
        }
    };

    _self.resolveCollision = function(body, other) {
        if(other.isStatic) {

            var center1 = {
                x: body.x+body.width/2,
                y: body.y-body.height/2
            };
            var center2 = {
                x: other.x+other.width/2,
                y: other.y-other.height/2
            };

            if(center1.x <= center2.x && center1.y >= center2.y) {
                (function(){
                    var corner1 = {
                        x: body.x + body.width,
                        y: body.y - body.height
                    };
                    var corner2 = {
                        x: other.x,
                        y: other.y
                    };

                    var tangent1 = (corner2.y-corner1.y)/(corner2.x-corner1.x);
                    var tangent2 = (body.dy)/(body.dx);

                    if(Math.abs(tangent2) < Math.abs(tangent1)) {
                        return _self.changeX(body, other)
                    } else {
                        return _self.changeY(body, other)
                    }
                })()
            } else if(center1.x >= center2.x && center1.y <= center2.y) {
                (function(){
                    var corner1 = {
                        x: body.x,
                        y: body.y
                    };
                    var corner2 = {
                        x: other.x + other.width,
                        y: other.y - other.height
                    };

                    var tangent1 = (corner2.y-corner1.y)/(corner2.x-corner1.x);
                    var tangent2 = (body.dy)/(body.dx);

                    if(Math.abs(tangent2) < Math.abs(tangent1)) {
                        return _self.changeX(body, other)
                    } else {
                        return _self.changeY(body, other)
                    }
                })()
            } else if(center1.x > center2.x && center1.y > center2.y) {
                (function(){
                    var corner1 = {
                        x: body.x,
                        y: body.y - body.height
                    };
                    var corner2 = {
                        x: other.x + other.width,
                        y: other.y
                    };

                    var tangent1 = (corner2.y-corner1.y)/(corner2.x-corner1.x);
                    var tangent2 = (body.dy)/(body.dx);

                    if(Math.abs(tangent2) < Math.abs(tangent1)) {
                        return _self.changeX(body, other)
                    } else {
                        return _self.changeY(body, other)
                    }
                })()
            } else if(center1.x < center2.x && center1.y < center2.y) {
                (function(){
                    var corner1 = {
                        x: body.x + body.width,
                        y: body.y
                    };
                    var corner2 = {
                        x: other.x,
                        y: other.y - other.height
                    };

                    var tangent1 = (corner2.y-corner1.y)/(corner2.x-corner1.x);
                    var tangent2 = (body.dy)/(body.dx);

                    if(Math.abs(tangent2) < Math.abs(tangent1)) {
                        return _self.changeX(body, other)
                    } else {
                        return _self.changeY(body, other)
                    }
                })()
            }
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

        var list = [];
        for(var i = startI;i <= endI; i++){
            for(var j = startJ;j <= endJ; j++){
                var cell = map.grid[i][j];
                if(cell) list.push({
                    i: i,
                    j: j,
                    cell: cell
                });
            }
        }
        return list;
    };

    _self.isCollision = function(object1, object2) {
        _self.calcCenterAndHalfSize(object1);
        _self.calcCenterAndHalfSize(object2);
        if ( Math.abs(object1.center.x - object2.center.x) > object1.halfSize.x + object2.halfSize.x ) return false;
        if ( Math.abs(object1.center.y - object2.center.y) > object1.halfSize.y + object2.halfSize.y ) return false;
        return true;
    };

    _self.collisionPriority = function(object1, object2) {
        _self.calcCenterAndHalfSize(object1);
        _self.calcCenterAndHalfSize(object2);
        var distX = (object1.halfSize.x + object2.halfSize.x) - Math.abs(object1.center.x - object2.center.x);
        var distY = (object1.halfSize.y + object2.halfSize.y) - Math.abs(object1.center.y - object2.center.y);
        return distX > distY ? 'x' : 'y';
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