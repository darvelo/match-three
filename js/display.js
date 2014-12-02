import { $$ } from 'util/dom';
import settings from 'settings';

var canvas = document.createElement('canvas');
export var ctx = canvas.getContext('2d');
var rows = settings.rows;
var cols = settings.cols;
var jewelSize = settings.jewelSize;
var firstRun = true;

function setup () {
    var boardElement = $$('#game-screen .game-board')[0];

    canvas.classList.add('board');
    canvas.width = cols * jewelSize;
    canvas.height = rows * jewelSize;

    boardElement.appendChild(canvas);
}

export function initialize (callback) {
    if (firstRun) {
        setup();
        firstRun = false;
    }

    callback();
}
