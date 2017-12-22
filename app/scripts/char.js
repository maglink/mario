module.exports = function(game, onCharDie) {
    var _self = this;

    _self.game = game;
    _self.body = null;

    _self.charWidth = 0.9;
    _self.charHeight = 0.9;
    _self.charBigHeight = 1.9;

    _self.CreateBody = function () {
        _self.body = _self.game.world.AddBody({
            width: _self.charWidth,
            image: _self.imageStand
        });
        _self.body.renderer.front = true;

        _self.game.world.AddBodyEventListener(_self.body, 'onGridTouch', function (event) {
            if(_self.isDead) {
                return;
            }

            if(event.side === 'bottom') {
                _self.isGrounded = true;
                return;
            }
            if(event.side === 'top') {
                _self.isJumping = false;
                if(event.cells[0].onTouch) {
                    event.cells[0].onTouch({marioMode: _self.marioMode})
                }
                return;
            }

            if(!event.side && event.axis === 'y' && event.cells[0].type === 'question_block') {
                var cellBody = event.cells[0];
                var cellCenter = {
                    x: cellBody.x+1/2,
                    y: cellBody.y-1/2
                };
                var bodyCenter = {
                    x: _self.body.physics.x+_self.body.physics.width/2,
                    y: _self.body.physics.y-_self.body.physics.height/2
                };
                if(cellCenter.y > bodyCenter.y) {
                    _self.body.physics.y = cellBody.y - 1;
                    _self.isJumping = false;
                    if(event.cells[0].onTouch) {
                        event.cells[0].onTouch({marioMode: _self.marioMode})
                    }
                    return;
                }
            }

            if(event.cells[0].type === 'coin') {
                event.cells[0].onTouch();
            }
        });
        _self.body.physics.collideObjectsFilter = function(other){
            if(_self.isStarman && other.type === 'enemy') {
                return false;
            }
            return true
        };
        _self.game.world.AddBodyEventListener(_self.body, 'onObjectTouch', function (event) {
            if(_self.isDead) {
                return;
            }

            if(event.object.type === 'mushroom') {
                game.sounds.Play('powerup');
                if(_self.marioMode === 'small') {
                    _self.setSuperMario();
                } else {
                    game.addGamePoints(1000)
                }
                _self.game.world.RemoveBody(event.object);
            }
            if(event.object.type === 'flower') {
                game.sounds.Play('powerup');
                if(_self.marioMode === 'super') {
                    _self.setLuigiMario();
                } else {
                    game.addGamePoints(1000)
                }
                _self.game.world.RemoveBody(event.object);
            }

            if(event.object.type === 'star') {
                game.sounds.Play('powerup');
                _self.setStarMan();
                _self.game.world.RemoveBody(event.object);
            }
            if(event.object.type === 'level-up') {
                game.sounds.Play('1up');
                game.AddLife();
                _self.game.world.RemoveBody(event.object);
            }
            if(event.object.type === 'enemy' && (event.side !== 'bottom')) {
                _self.setDamage();
            }
            if(event.object.type === 'tbullet') {
                _self.setDamage();
            }
        });
        game.world.AddBodyEventListener(_self.body, 'onZoneIn', function (zone) {
            if(_self.isDead) {
                return;
            }
            if(zone.name === "kill_zone") {
                _self.die();
            }
            if(zone.name === "port1") {
                _self.readyToPort1 = true;
            }
            if(zone.name === "port2") {
                _self.readyToPort2 = true;
            }
        });
        game.world.AddBodyEventListener(_self.body, 'onZoneOut', function (zone) {
            if(_self.isDead) {
                return;
            }
            if(zone.name === "port1") {
                _self.readyToPort1 = false;
            }
            if(zone.name === "port2") {
                _self.readyToPort2 = false;
            }
        });
        _self.setSmallMario();
        //_self.setSuperMario();
        //_self.setLuigiMario();
    };

    _self.timeleft = 400;
    _self.isGrounded = false;
    _self.isDucking = false;
    _self.marioMode = 'small';
    _self.isVisible = true;
    _self.isDead = false;
    _self.isFinish = false;
    _self.readyToPort1 = false;
    _self.readyToPort2 = false;
    _self.inOverworld = false;
    _self.inBackground = false;
    _self.isTeleporting = false;
    _self.isProtected = false;

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
        keyName: "A/up",
        keyChars: ["ArrowUp", "W", "w", " ", "K", "k", "Ц", "ц", "Л", "л"],
        handlerPress: function () {
            if(_self.isFinish) {
                return;
            }
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
        keyName: "B",
        keyChars: ["Shift", "J", "j", "О", "о"],
        handlerPress: function () {
            if(_self.isFinish) {
                return;
            }
            if(_self.marioMode === 'luigi') {
                _self.createBullet()
            }
            _self.runSpeed = _self.runSpeedBoosted;
        },
        handlerRelease: function () {
            _self.runSpeed = _self.runSpeedDefault;
        }
    });
    _self.game.controlKeys.AddKeyHandlers({
        keyName: "down",
        keyChars: ["ArrowDown", "S", "s", "Ы", "ы"],
        handlerPress: function () {
            if(_self.isTeleporting) {
                return;
            }
            if(_self.isFinish) {
                return;
            }
            if(!_self.isTeleporting && _self.readyToPort1){
                _self.runEnterToBackground();
                return;
            }

            if(!_self.isGrounded) {
                return;
            }
            _self.isDucking = true;
            if(_self.marioMode !== 'small') {
                _self.body.physics.height = _self.charHeight;
                _self.body.physics.y -= _self.charBigHeight - _self.charHeight;
            }
        },
        handlerRelease: function () {
            if(_self.isTeleporting) {
                return;
            }
            if(_self.isDucking){
                _self.isDucking = false;
                if(_self.marioMode !== 'small') {
                    _self.body.physics.height = _self.charBigHeight ;
                    _self.body.physics.y += _self.charBigHeight - _self.charHeight;
                }
            }
        }
    });
    _self.game.controlKeys.AddKeyHandlers({
        keyName: "left",
        keyChars: ["ArrowLeft", "A", "a", "Ф", "ф"],
        handlerPress: function () {
            if(_self.isFinish) {
                return;
            }
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
        keyChars: ["ArrowRight", "D", "d", "В", "в"],
        handlerPress: function () {
            if(_self.isFinish) {
                return;
            }
            if(!_self.isTeleporting && _self.readyToPort2){
                _self.runExitFromBackground();
                return;
            }

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
        if(_self.isDead || _self.isTeleporting || _self.isFinish) {
            _self.beforeRender();
            return;
        }

        if(_self.isJumping && !_self.isDucking) {
            if(_self.jumpIterationCount++ === 0) {
                game.sounds.Play('jump');
                _self.body.physics.vy = _self.jumpMinHeight*(1000/_self.jumpTime);
            } else if(_self.jumpIterationCount < _self.jumpTime/_self.game.physics.timeFrequency) {
                _self.body.physics.vy += (_self.jumpMaxHeight*(1000/_self.jumpTime) - _self.jumpMinHeight*(1000/_self.jumpTime))/_self.game.physics.timeFrequency;
            }
        }
        if(_self.isRunning && !_self.isDucking) {
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
            if(_self.isDucking) {
                _self.body.physics.friction = 0.1;
            } else {
                _self.body.physics.friction = _self.game.physics.defaultFriction;
            }
        }

        if(!_self.isGrounded) {
            _self.body.physics.friction = 0;
        }

        _self.beforeRender();
        setTimeout(function () {
            _self.isGrounded = false;
        }, 0)
    });

    _self.game.physics.After(function () {
        if(!_self.charMaxPosX) {
            _self.charMaxPosX = _self.body.physics.x;
        }
        if(_self.body.physics.x < _self.charMaxPosX - 8) {
            _self.body.physics.x = _self.charMaxPosX - 8;
            if(_self.body.physics.vx < 0) {
                _self.body.physics.vx = 0;
            }
        }
        if(_self.body.physics.x > _self.charMaxPosX) {
            _self.charMaxPosX = _self.body.physics.x;
        }
    });

    //---------------------


    _self.lastImagesColor = 'green';
    _self.setImagesColoredSmall = function(color) {
        _self.lastImagesColor = color;
        _self.imageStand = _self.game.renderer.LoadImage('files/char/colored/small_'+color+'_stand.png');
        _self.imageDuck = _self.game.renderer.LoadImage('files/char/colored/small_'+color+'_stand.png');
        _self.imageSkid = _self.game.renderer.LoadImage('files/char/colored/small_'+color+'_skid.png');
        _self.imageJump = _self.game.renderer.LoadImage('files/char/colored/small_'+color+'_jump.png');
        if(!_self.imageRunXSmall) {
            _self.imageRunXSmall = new _self.game.renderer.animation({
                imagesCount: 3,
                imageUrl: function(i) {
                    var color = _self.lastImagesColor;
                    return 'files/char/colored/small_'+color+'_run'+(i+1)+".png"
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
        }
        _self.imageRun = _self.imageRunXSmall;
    };

    _self.setImagesColoredSuper = function(color) {
        _self.lastImagesColor = color;
        _self.imageStand = _self.game.renderer.LoadImage('files/char/colored/'+color+'_stand.png');
        _self.imageDuck = _self.game.renderer.LoadImage('files/char/colored/'+color+'_duck.png');
        _self.imageSkid = _self.game.renderer.LoadImage('files/char/colored/'+color+'_skid.png');
        _self.imageJump = _self.game.renderer.LoadImage('files/char/colored/'+color+'_jump.png');
        if(!_self.imageRunXSuper) {
            _self.imageRunXSuper = new _self.game.renderer.animation({
                imagesCount: 3,
                imageUrl: function(i) {
                    var color = _self.lastImagesColor;
                    if(_self.isThrowing) {
                        return 'files/char/colored/'+color+'_throw_run'+(i+1)+".png"
                    } else {
                        return 'files/char/colored/'+color+'_run'+(i+1)+".png"
                    }
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
        }
        _self.imageRun = _self.imageRunXSuper;

        _self.imageThrowStand = _self.game.renderer.LoadImage('files/char/colored/'+color+'_throw_run1.png');
        _self.imageThrowSkid = _self.game.renderer.LoadImage('files/char/colored/'+color+'_throw_skid.png');
        _self.imageThrowJump = _self.game.renderer.LoadImage('files/char/colored/'+color+'_throw.png');
    };

    _self.setImagesSmallMario = function() {
        _self.imageStand = _self.game.renderer.LoadImage('files/char/mario.png');
        _self.imageDuck = _self.game.renderer.LoadImage('files/char/mario.png');
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
    };

    _self.setImagesSuperMario = function() {
        _self.imageStand = _self.game.renderer.LoadImage('files/char/super-mario.png');
        _self.imageDuck = _self.game.renderer.LoadImage('files/char/super-mario-duck.png');
        _self.imageSkid = _self.game.renderer.LoadImage('files/char/super-mario-skid.png');
        _self.imageJump = _self.game.renderer.LoadImage('files/char/super-mario-jump.png');
        _self.imageRun = new _self.game.renderer.animation({
            imagesCount: 3,
            imageUrl: function(i) {
                return 'files/char/super-mario-run'+(i+1)+".png"
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
    };

    _self.setImagesLuigiMario = function() {
        _self.imageStand = _self.game.renderer.LoadImage('files/char/luigi.png');
        _self.imageDuck = _self.game.renderer.LoadImage('files/char/luigi-duck.png');
        _self.imageSkid = _self.game.renderer.LoadImage('files/char/luigi-skid.png');
        _self.imageJump = _self.game.renderer.LoadImage('files/char/luigi-jump.png');
        _self.imageRun = new _self.game.renderer.animation({
            imagesCount: 3,
            imageUrl: function(i) {
                if(_self.isThrowing) {
                    return 'files/char/luigi-throw-run'+(i+1)+".png"
                } else {
                    return 'files/char/luigi-run'+(i+1)+".png"
                }
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
        _self.imageThrowStand = _self.game.renderer.LoadImage('files/char/luigi-throw-run1.png');
        _self.imageThrowSkid = _self.game.renderer.LoadImage('files/char/luigi-throw-skid.png');
        _self.imageThrowJump = _self.game.renderer.LoadImage('files/char/luigi-throw.png');
    };

    _self.throwTimeout = null;
    _self.isThrowing = false;
    _self.setImagesLuigiThrow = function () {
        _self.isThrowing = true;
        if(_self.throwTimeout) {
            clearTimeout(_self.throwTimeout)
        }
        _self.throwTimeout = setTimeout(function(){
            _self.isThrowing = false;
        }, 100)
    };

    //---------------------

    _self.setSmallMario = function () {
        _self.marioMode = 'small';
        _self.body.physics.height = 1;
        _self.setImagesSmallMario();
    };

    _self.setSuperMario = function () {
        _self.marioMode = 'super';
        _self.body.physics.height = _self.charBigHeight;
        _self.body.physics.y += _self.charBigHeight - _self.charHeight;
        _self.setImagesSuperMario();
    };

    _self.setLuigiMario = function () {
        _self.marioMode = 'luigi';
        _self.setImagesLuigiMario();
    };

    _self.timeleft = game.timeleft;
    game.UpdateTimeleft(_self.timeleft);

    _self.timeleftInterval = setInterval(function(){
        _self.timeleft--;
        game.UpdateTimeleft(_self.timeleft);

        if(_self.timeleft < 200 && !_self.timeleftHasBeedHurry) {
            _self.timeleftHasBeedHurry = true;
            game.sounds.StopBackground();
            game.sounds.Play('hurry-start');
            setTimeout(function () {
                game.sounds.PlayBackground('hurry');
            }, 4000);
        }

        if(_self.timeleft <= 0) {
            _self.die();
        }

    }, 500);

    _self.isHurryMode = function() {
        return _self.timeleft < 200;
    };

    _self.setStarMan = function(){
        if(_self.isHurryMode()){
            game.sounds.PlayBackground('hurry-starman');
        } else {
            game.sounds.PlayBackground('starman');
        }

        _self.isStarman = true;


        var changeSpeed = 100;
        var lastColor = 'black';
        var changeTimeout = null;
        var changeColor = function () {
            if(lastColor === 'black') {
                if(_self.marioMode === 'small') {
                    _self.setImagesColoredSmall('red');
                } else {
                    _self.setImagesColoredSuper('red')
                }
                lastColor = 'red'
            } else if (lastColor === 'red') {
                if(_self.marioMode === 'small') {
                    _self.setImagesColoredSmall('green');
                } else {
                    _self.setImagesColoredSuper('green')
                }
                lastColor = 'green'
            } else if (lastColor === 'green') {
                if(_self.marioMode === 'small') {
                    _self.setImagesColoredSmall('black');
                } else {
                    _self.setImagesColoredSuper('black')
                }
                lastColor = 'black'
            }
            changeSpeed += 1;
            changeTimeout = setTimeout(function() {
                changeColor()
            }, changeSpeed)
        };

        changeColor();

        _self.starManTimeout = setTimeout(function () {
            clearTimeout(changeTimeout);
            _self.isStarman = false;
            if(_self.marioMode === 'small') {
                _self.setImagesSmallMario()
            } else if(_self.marioMode === 'super') {
                _self.setImagesSuperMario()
            } else if(_self.marioMode === 'luigi') {
                _self.setImagesLuigiMario()
            }
            if(_self.isHurryMode()){
                game.sounds.PlayBackground('hurry');
            } else {
                game.sounds.PlayBackground('main_theme');
            }
        }, 13000);
    };

    _self.setDamage = function () {
        if(_self.isProtected || _self.isStarman) {
            return;
        }
        if(_self.marioMode === 'luigi') {
            _self.game.sounds.Play('warp');
            _self.setSuperMario();
            _self.setProtection();
        } else if(_self.marioMode === 'super') {
            _self.game.sounds.Play('warp');
            _self.setSmallMario();
            _self.setProtection();
        } else {
            _self.die();
        }
    };

    _self.setProtection = function(){
        _self.isProtected = true;
        var count = 0;
        var interval = setInterval(function () {
            count++;
            if(count > 40) {
                _self.isProtected = false;
                _self.isVisible = true;
                clearInterval(interval);
                return;
            }
            _self.isVisible = !(count % 2);
        }, 50)
    };

    _self.die = function() {
        if(_self.starManTimeout) {
            clearInterval(_self.starManTimeout)
        }
        if(_self.timeleftInterval) {
            clearInterval(_self.timeleftInterval)
        }
        game.sounds.StopBackground();
        game.sounds.Play('die');
        _self.game.physics.timeRate = 0;
        _self.isDead = true;
        _self.body.physics.noCollideObjects = true;
        _self.body.physics.vx = 0;
        _self.body.physics.vy = 0;

        var count = 0;
        var interval = setInterval(function () {
            count+=1000/30;
            if(count >= 5000) {
                clearInterval(interval);
                _self.game.physics.timeRate = 1;
                onCharDie();
                return;
            }

            if(count < 250) {
                _self.body.renderer.yOffset -= 2;
            } else if(count > 1000) {
                _self.body.renderer.yOffset += 2;
            }
        }, 1000/30)
    };

    _self.imageBullet = new _self.game.renderer.animation({
        imagesCount: 4,
        imageUrl: function(i) {
            return 'files/bullet/bullet'+(i+1)+".png"
        },
        playSpeed: 1000/24
    });
    _self.imageBulletBlow = new _self.game.renderer.animation({
        imagesCount: 3,
        imageUrl: function(i) {
            return 'files/bullet/bullet-blow'+(i+1)+".png"
        },
        playSpeed: 1000/24,
        noLoop: true
    });
    _self.lastBullet1 = 0;
    _self.lastBullet2 = 0;
    _self.createBullet = function() {
        if(_self.isFinish) {
            return;
        }
        if(Date.now() - _self.lastBullet1 < 1000 && Date.now() - _self.lastBullet2 < 1000) {
            return;
        }
        if(_self.lastBullet1 < _self.lastBullet2) {
            _self.lastBullet1 = Date.now();
        } else {
            _self.lastBullet2 = Date.now();
        }
        _self.setImagesLuigiThrow();
        var speed = 11;
        var side = _self.body.renderer.flip ? -1 : 1;
        _self.game.sounds.Play('bullet');
        var bullet = _self.game.world.AddBody({
            type: 'bullet',
            width: 0.5,
            height: 0.5,
            x: _self.body.physics.x + (_self.body.renderer.flip ? -0.7 : 1.1),
            y: _self.body.physics.y - 0.2,
            vx: side * speed,
            image: _self.imageBullet.Play()
        });
        var runInterval = setInterval(function () {
            bullet.physics.vx = side * speed;
        }, 1000/30);

        var alreadyBlowed = false;
        var blow = function() {
            if(alreadyBlowed) {
                return;
            }
            alreadyBlowed = true;
            clearInterval(runInterval);
            bullet.physics.isStatic = true;
            bullet.physics.noCollideObjects = true;

            var imageBulletBlow = new _self.game.renderer.animation({
                imagesCount: 3,
                imageUrl: function(i) {
                    return 'files/bullet/bullet-blow'+(i+1)+".png"
                },
                playSpeed: 1000/10,
                noLoop: true
            });
            bullet.renderer.image = imageBulletBlow.Play();
            setTimeout(function () {
                _self.game.world.RemoveBody(bullet)
            }, (1000/10)*3);
        };

        setTimeout(function(){
            blow();
        }, 2000);

        _self.game.world.AddBodyEventListener(bullet, 'onObjectTouch', function (event) {
            if(event.object.type === 'enemy') {
                blow();
            }
        });
        _self.game.world.AddBodyEventListener(bullet, 'onGridTouch', function (event) {
            if(event.side === 'left' || event.side === 'right') {
                _self.game.sounds.Play('bump');
                blow();
            }
            if(event.side === 'bottom') {
                bullet.physics.vy = 11
            }
        });
        _self.game.world.AddBodyEventListener(bullet, 'onDestroy', function (event) {
            clearInterval(runInterval);
        });
    };

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

    _self.imageDead = _self.game.renderer.LoadImage('files/char/mario-dead.png');

    _self.beforeRender = function () {

        if(!_self.isVisible) {
            _self.body.renderer.image = null;
            return;
        }
        if(_self.isDead) {
            _self.body.renderer.image = _self.imageDead;
            return;
        }

        if(_self.isTeleporting){
            return;
        }

        _self.body.renderer.yOffset = 0;

        if(!_self.isGrounded) {
            if(_self.isThrowing) {
                _self.setImage(_self.imageThrowJump);
            } else {
                _self.setImage(_self.imageJump);
            }
        } else if(_self.isDucking) {
            _self.setImage(_self.imageDuck);
            if(_self.marioMode !== 'small') {
                _self.body.renderer.yOffset = -8;
            }
        } else if(_self.isRunning && _self.isGrounded) {
            if((_self.runningSide === 'left' && _self.body.physics.vx > 0)
                || (_self.runningSide === 'right' && _self.body.physics.vx < 0)) {

                if(_self.isThrowing) {
                    _self.setImage(_self.imageThrowSkid);
                } else {
                    _self.setImage(_self.imageSkid);
                }
            } else {
                _self.setImage(_self.imageRun);
            }
            if(_self.runningSide === 'left') {
                _self.body.renderer.flip = true;
            } else {
                _self.body.renderer.flip = false;
            }
            if(_self.isFinish) {
                _self.body.renderer.flip = false;
            }
        } else if(Math.abs(_self.body.physics.vx) > 0.05) {
            _self.setImage(_self.imageRun);
        } else {
            if(_self.isThrowing) {
                _self.setImage(_self.imageThrowStand);
            } else {
                _self.setImage(_self.imageStand);
            }
        }
    };

    _self.runEnterToBackground = function () {
        game.sounds.StopBackground();
        _self.game.sounds.Play('warp');
        _self.inOverworld = true;
        _self.inBackground = false;
        _self.isTeleporting = true;
        if(_self.marioMode !== 'small') {
            _self.setImage(_self.imageDuck);
            _self.body.renderer.yOffset = 0;
        } else {
            _self.setImage(_self.imageStand);
        }
        _self.body.renderer.front = false;
        _self.body.physics.friction = 1;
        var count = 0;
        var interval = setInterval(function () {
            count += 1000/30;
            if(count > 1500) {
                if(_self.isHurryMode()) {
                    game.sounds.PlayBackground('hurry-underground');
                } else {
                    game.sounds.PlayBackground('underworld');
                }
                _self.inOverworld = false;
                _self.inBackground = true;
                _self.isTeleporting = false;
                clearInterval(interval);
                _self.body.renderer.yOffset = 0;
                _self.body.renderer.front = true;

                _self.body.physics.x = 58.5;
                _self.body.physics.y = -23;
                _self.body.physics.friction = _self.game.physics.defaultFriction;

                return;
            }
            _self.body.renderer.yOffset += 1;
        }, 1000/30)

    };

    _self.runExitFromBackground = function () {
        game.sounds.StopBackground();
        _self.game.sounds.Play('warp');
        _self.inOverworld = false;
        _self.inBackground = true;
        _self.isTeleporting = true;
        if(_self.marioMode !== 'small') {
            _self.setImage(_self.imageDuck);
            _self.body.renderer.yOffset = -8;
        } else {
            _self.setImage(_self.imageStand);
            _self.body.renderer.yOffset = -2;
        }
        _self.body.renderer.front = false;
        _self.body.physics.friction = 1;

        var count = 0;
        var interval = setInterval(function () {
            count += 1000/30;
            if(count > 1500) {
                _self.inOverworld = true;
                _self.inBackground = false;
                _self.isTeleporting = true;
                clearInterval(interval);
                _self.body.renderer.xOffset = 0;

                _self.body.physics.x = 163.5;
                _self.body.physics.y = -12;

                _self.body.renderer.yOffset = 45;

                count = 0;
                interval = setInterval(function () {
                    count += 1000/30;
                    if(count > 1500) {

                        if(_self.isHurryMode()){
                            game.sounds.PlayBackground('hurry');
                        } else {
                            game.sounds.PlayBackground('main_theme');
                        }

                        _self.inOverworld = true;
                        _self.inBackground = false;
                        _self.isTeleporting = false;
                        clearInterval(interval);
                        _self.body.physics.friction = _self.game.physics.defaultFriction;

                        _self.body.renderer.xOffset = 0;
                        _self.body.renderer.yOffset = 0;

                        _self.body.renderer.front = true;

                        return;
                    }
                    _self.body.renderer.yOffset -= 1;
                }, 1000/30);


                return;
            }
            _self.body.renderer.xOffset += 1;
        }, 1000/30)
    };

    _self.finish = function() {
        clearInterval(_self.timeleftInterval);

        _self.isFinish = true;
        var runInterval = setInterval(function(){
            _self.body.physics.vx = 2
        }, 1000/30);

        setTimeout(function () {
            clearInterval(runInterval)
        }, 10000)
    };

    return _self;
};