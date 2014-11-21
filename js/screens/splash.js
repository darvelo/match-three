import { bind } from 'util/dom';

var firstRun = true;
// avoid circular reference when requiring game module
var game;

function setup () {
    bind('#splash-screen', 'click', function () {
        game.showScreen('main-menu');
    });
}

export function run () {
    if (firstRun) {
        game = require('game');
        firstRun = false;
        setup();
    }
}
