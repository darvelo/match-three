import { bind } from 'util/dom';

var firstRun = true;
// avoid circular reference when requiring game module
var game;

function setup () {
    bind('#main-menu ul.menu', 'click', function (e) {
        var action;

        if (e.target.nodeName.toLowerCase() === 'button') {
            action = e.target.getAttribute('data-name');
            game.showScreen(action);
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
