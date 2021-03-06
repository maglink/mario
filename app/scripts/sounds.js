var $ = require('jquery');
var Cookie = require('./cookie.js');

module.exports.LoadSounds = function(game) {
    game.sounds.masterVolume = 1;
    game.sounds.AddBackgroundMusic('main_theme', 'files/music/Jingle Bells.mp3', 0.25);
    //game.sounds.AddBackgroundMusic('main_theme', 'files/music/01-main-theme-overworld.mp3', 0.5);
    game.sounds.AddBackgroundMusic('underworld', 'files/music/Its Beginning To Look A Lot Like Christmas.mp3', 0.5);
    //game.sounds.AddBackgroundMusic('underworld', 'files/music/02-underworld.mp3', 0.5);
    game.sounds.AddBackgroundMusic('starman', 'files/music/Merry Christmas – Jingle Bells.mp3', 0.5);
    //game.sounds.AddBackgroundMusic('starman', 'files/music/05-starman.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry', 'files/music/Calavera – You\'re Better At Living Than You Think.mp3', 0.5);
    //game.sounds.AddBackgroundMusic('hurry', 'files/music/13-hurry.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry-starman', 'files/music/Merry Christmas – Jingle Bells.mp3', 0.5);
    //game.sounds.AddBackgroundMusic('hurry-starman', 'files/music/17-hurry-starman-.mp3', 0.5);
    game.sounds.AddBackgroundMusic('hurry-underground', 'files/music/Calavera – You\'re Better At Living Than You Think.mp3', 0.5);
    //game.sounds.AddBackgroundMusic('hurry-underground', 'files/music/14-hurry-underground-.mp3', 0.5);

    game.sounds.AddSound('coin', 'files/sounds/Coin.wav');
    game.sounds.AddSound('break', 'files/sounds/Break.wav');
    game.sounds.AddSound('item', 'files/sounds/Item.wav');
    game.sounds.AddSound('vine', 'files/sounds/Vine.wav');
    game.sounds.AddSound('powerup', 'files/sounds/Powerup.wav');
    game.sounds.AddSound('jump', 'files/sounds/Jump.wav');
    game.sounds.AddSound('bump', 'files/sounds/Bump.wav');
    game.sounds.AddSound('die', 'files/sounds/Die.wav');
    game.sounds.AddSound('squish', 'files/sounds/Squish.wav');
    game.sounds.AddSound('1up', 'files/sounds/1up.wav');
    game.sounds.AddSound('bullet', 'files/sounds/Fire Ball.wav');
    game.sounds.AddSound('warp', 'files/sounds/Warp.wav');
    game.sounds.AddSound('flag', 'files/sounds/Flagpole.wav');
    game.sounds.AddSound('gameover', 'files/sounds/Game Over.wav');
    game.sounds.AddSound('level_complete', 'files/sounds/smb_level_complete.wav');
    game.sounds.AddSound('beep', 'files/sounds/Beep.wav');

    game.sounds.AddSound('game-over', 'files/music/09-game-over.mp3');
    game.sounds.AddSound('hurry-start', 'files/music/13-hurry-start.mp3');
};

module.exports.LoadSoundsSettings = function(game) {
    var soundsVolume = Number(Cookie.getCookie("sounds_volume"));
    if(soundsVolume) {
        game.sounds.SetMasterVolume(soundsVolume);
        $("#sounds_button_cancelled").hide();
        $("#sounds_button").show();
    } else if(soundsVolume === 0) {
        game.sounds.SetMasterVolume(0);
        $("#sounds_button_cancelled").show();
        $("#sounds_button").hide();
    } else {
        game.sounds.SetMasterVolume(1);
        $("#sounds_button_cancelled").hide();
        $("#sounds_button").show();
    }

    $("#sounds_button").click(function () {
        if(game.sounds.masterVolume) {
            game.sounds.lastMasterVolume = game.sounds.masterVolume;
        }
        game.sounds.SetMasterVolume(0);
        $(this).hide();
        $("#sounds_button_cancelled").show();
        Cookie.setCookie("sounds_volume", 0);
    });

    $("#sounds_button_cancelled").click(function () {
        game.sounds.SetMasterVolume(game.sounds.lastMasterVolume || 1);
        $(this).hide();
        $("#sounds_button").show();
        Cookie.setCookie("sounds_volume", game.sounds.masterVolume);
    });
}