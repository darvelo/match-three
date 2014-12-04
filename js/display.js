import { $$ } from 'util/dom';
import settings from 'settings';

var canvas = document.createElement('canvas');
export var ctx = canvas.getContext('2d');
var rows = settings.rows;
var cols = settings.cols;
var jewelSize = settings.jewelSize;
var firstRun = true;

function createBackground () {
    var bg = document.createElement('canvas');
    var ctx = bg.getContext('2d');
    var x, y;

    bg.classList.add('board-bg');
    bg.width = cols * jewelSize;
    bg.height = rows * jewelSize;

    ctx.fillStyle = 'rgba(255,235,255,0.15)';

    for (x = 0; x < cols; ++x) {
        for (y = 0; y < cols; ++y) {
            if ((x+y) % 2) {
                ctx.fillRect(
                    x * jewelSize, y * jewelSize,
                    jewelSize, jewelSize
                );
            }
        }
    }

    return bg;
}

function setup () {
    var boardElement = $$('#game-screen .game-board')[0];

    canvas.classList.add('board');
    canvas.width = cols * jewelSize;
    canvas.height = rows * jewelSize;

    boardElement.appendChild(createBackground());
    boardElement.appendChild(canvas);
}

export function initialize (callback) {
    if (firstRun) {
        setup();
        firstRun = false;
    }

    callback();
}
