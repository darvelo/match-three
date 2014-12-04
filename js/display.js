import { $$ } from 'util/dom';
import settings from 'settings';
import preload from 'util/loader';
import loadedImages from 'images';

var boardElement;
var boardDimensions;

var canvas = document.createElement('canvas');
export var ctx = canvas.getContext('2d');
var rows = settings.rows;
var cols = settings.cols;
// size changes based on screen size
var jewelSize;
var firstRun = true;

function createBackground () {
    var bg = document.createElement('canvas');
    var ctx = bg.getContext('2d');
    var x, y;

    bg.classList.add('board-bg');
    bg.width = boardDimensions.width;
    bg.height = boardDimensions.height;

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

function loadSprites () {
    preload('images/jewels' + settings.jewelSize + '.png', loadedImages);
}

function setup () {
    boardElement = $$('#game-screen .game-board')[0];
    boardDimensions = boardElement.getBoundingClientRect();

    // size changes based on screen size
    jewelSize = settings.jewelSize = boardDimensions.width / settings.cols;

    loadSprites();

    canvas.classList.add('board');
    canvas.width = boardDimensions.width;
    canvas.height = boardDimensions.height;

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
