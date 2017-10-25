module.exports = function() {
    var _self = this;

    _self.zoomRate = 1;
    _self.x = 0;
    _self.y = 0;
    _self.followObject = null;
    _self.frequency = 1000/30;
    _self.smoothTimeout = 500;
    _self.targetX = _self.x;
    _self.targetY = _self.y;

    _self.SetPosition = function(x, y, smooth) {
        _self.targetX = x;
        _self.targetY = y;
        if(!smooth) {
            _self.x = x;
            _self.y = y;
        }
    };

    _self.SetZoom = function(zoomRate) {
        _self.zoomRate = zoomRate;
    };

    _self.Follow = function(body) {
        _self.followObject = body;
    };

    _self.SetSmoothTimeout = function(timeout) {
        _self.smoothTimeout = timeout;
    };

    _self.setFrequency = function(frequency) {
        _self.frequency = frequency;
    };

    _self.update = function() {
        if(_self.followObject) {
            _self.targetX = _self.followObject.physics.x + _self.followObject.physics.width/2;
            _self.targetY = _self.followObject.physics.y - _self.followObject.physics.height/2;
        }

        var vx = _self.targetX - _self.x;
        var vy = _self.targetY - _self.y;

        var dx = vx*(_self.frequency/_self.smoothTimeout);
        var dy = vy*(_self.frequency/_self.smoothTimeout);

        _self.x += dx;
        _self.y += dy;

    };

    return _self;
};