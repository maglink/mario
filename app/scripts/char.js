module.exports = function(game) {
    var _self = this;

    _self.game = game;
    _self.body = null;

    _self.CreateBody = function () {
        _self.body = _self.game.world.AddBody({
            density: 4,
            image: _self.imageStand
        });
        _self.game.world.AddBodyEventListener(_self.body, 'onGridTouch', function (event) {
            if(event.side === 'bottom') {
                _self.isGrounded = true;
            }
        });
    };

    _self.isGrounded = false;

    _self.jumpTime = 200;
    _self.jumpMinHeight = 2;
    _self.jumpMaxHeight = 20;
    _self.isJumping = false;
    _self.jumpIterationCount = 0;

    _self.runStartTime = 500;
    _self.runIterationCount = 0;
    _self.runSpeedDefault = 5;
    _self.runSpeedBoosted = 10;
    _self.runSpeed = _self.runSpeedDefault;
    _self.isRunning = false;
    _self.runningSide = '';

    _self.game.controlKeys.AddKeyHandlers({
        keyName: "up",
        keyChars: ["ArrowUp", "w", " ", "k"],
        handlerPress: function () {
            if(_self.isGrounded) {
                _self.isJumping = true;
                _self.jumpIterationCount = 0;
            }
        },
        handlerRelease: function () {
            _self.isJumping = false;
        }
    });
    _self.game.controlKeys.AddKeyHandlers({
        keyName: "down",
        keyChars: ["ArrowDown", "s", "j"],
        handlerPress: function () {
            _self.runSpeed = _self.runSpeedBoosted;
        },
        handlerRelease: function () {
            _self.runSpeed = _self.runSpeedDefault;
        }
    });
    _self.game.controlKeys.AddKeyHandlers({
        keyName: "left",
        keyChars: ["ArrowLeft", "a"],
        handlerPress: function () {
            _self.isRunning = true;
            _self.runningSide = 'left';
            _self.runIterationCount = 0;
        },
        handlerRelease: function () {
            if(_self.runningSide !== 'right') {
                _self.isRunning = false;
            }
        }
    });
    _self.game.controlKeys.AddKeyHandlers({
        keyName: "right",
        keyChars: ["ArrowRight", "d"],
        handlerPress: function () {
            _self.isRunning = true;
            _self.runningSide = 'right';
            _self.runIterationCount = 0;
        },
        handlerRelease: function () {
            if(_self.runningSide !== 'left') {
                _self.isRunning = false;
            }
        }
    });

    _self.game.physics.Before(function () {
        if(_self.isJumping) {
            if(_self.jumpIterationCount++ === 0) {
                _self.body.physics.vy = _self.jumpMinHeight*(1000/_self.jumpTime);
            } else if(_self.jumpIterationCount < _self.jumpTime/_self.game.physics.timeFrequency) {
                _self.body.physics.vy += (_self.jumpMaxHeight*(1000/_self.jumpTime) - _self.jumpMinHeight*(1000/_self.jumpTime))/_self.game.physics.timeFrequency;
            }
        }
        if(_self.isRunning) {
            _self.body.physics.friction = 0;
            var rate = 1/(_self.runStartTime/_self.game.physics.timeFrequency);

            if(_self.runningSide === 'left') {
                _self.body.physics.vx += rate * _self.runSpeed * -1;
                if(_self.body.physics.vx < _self.runSpeed * -1) {
                    _self.body.physics.vx = _self.runSpeed * -1;
                }
            } else {
                _self.body.physics.vx += rate * _self.runSpeed;
                if(_self.body.physics.vx > _self.runSpeed) {
                    _self.body.physics.vx = _self.runSpeed;
                }
            }
        } else {
            _self.body.physics.friction =_self.defaultFriction;
        }

        _self.beforeRender();
        _self.isGrounded = false;
    });


    _self.imageStand = _self.game.renderer.LoadImage('files/char/mario.png');
    _self.imageSkid = _self.game.renderer.LoadImage('files/char/mario-skid.png');
    _self.imageJump = _self.game.renderer.LoadImage('files/char/mario-jump.png');

    _self.imageRun = new _self.game.renderer.animation({
        imagesCount: 3,
        imageUrl: function(i) {
            return 'files/char/mario-run'+(i+1)+".png"
        },
        playSpeed: function(){
            var add;
            if(_self.runSpeed === _self.runSpeedBoosted) {
                add = 12*(Math.abs(_self.body.physics.vx)/_self.runSpeed);
            } else {
                add = 8*(Math.abs(_self.body.physics.vx)/_self.runSpeed);
            }
            return 1000/(8+add);
        }
    });

    _self.setImage = function(image) {
        var old = _self.body.renderer.image;
        if(old === image) {
            return;
        }
        if(old && old.Stop) {
            old.Stop();
        }
        _self.body.renderer.image = image;
        if(image && image.Play) {
            image.Play();
        }
    };

    _self.beforeRender = function () {
        if(!_self.isGrounded) {
            _self.setImage(_self.imageJump);
        } else if(_self.isRunning && _self.isGrounded) {
            if((_self.runningSide === 'left' && _self.body.physics.vx > 0)
                || (_self.runningSide === 'right' && _self.body.physics.vx < 0)) {
                _self.setImage(_self.imageSkid);
            } else {
                _self.setImage(_self.imageRun);
            }
            if(_self.runningSide === 'left') {
                _self.body.renderer.flip = true;
            } else {
                _self.body.renderer.flip = false;
            }
        } else if(Math.abs(_self.body.physics.vx) > 0.05) {
            _self.setImage(_self.imageRun);
        } else {
            _self.setImage(_self.imageStand);
        }
    };

    return _self;
};