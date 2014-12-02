import { bind } from 'util/dom';

var firstRun = true;
// avoid circular reference when requiring game module
var game;

function setup () {
    bind('#main-menu ul.menu', 'click', function (e) {
        var screenName;

        if (e.target.nodeName.toLowerCase() === 'button') {
            screenName = e.target.getAttribute('data-name');
            game.showScreen(screenName);
        }
    });
}

export function run () {
    if (firstRun) {
        game = require('game');
        firstRun = false;
        setup();
    }
}
