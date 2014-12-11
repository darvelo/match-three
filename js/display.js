import { $$ } from 'util/dom';
import settings from 'settings';
import preloader from 'util/loader';
import loadedImages from 'images';

var boardElement;
var boardDimensions;

var canvas = document.createElement('canvas');
export var ctx = canvas.getContext('2d');
var rows = settings.rows;
var cols = settings.cols;
// size changes based on screen size
var jewelSize;
// holds filename to get access to jewels sprite image from the loadedImages object
var jewelSpritesFilename;
// holds a copy of the board received from the board module
var jewels;
// flag to only run setup once
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

function drawJewel (type, x, y) {
    var image = loadedImages[jewelSpritesFilename];

    ctx.drawImage(image,
                  type * jewelSize, 0, jewelSize, jewelSize,
                  x * jewelSize, y * jewelSize, jewelSize, jewelSize
                 );
}

export function redraw (newJewels, callback) {
    var x, y;
    jewels = newJewels;

    preloader.one(jewelSpritesFilename, () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (x = 0; x < cols; ++x) {
            for (y = 0; y < rows; ++y) {
                drawJewel(jewels[x][y], x, y);
            }
        }

        callback();
    });
}

function setup () {
    boardElement = $$('#game-screen .game-board')[0];
    boardDimensions = boardElement.getBoundingClientRect();

    // jewel size changes based on screen size
    jewelSize = settings.jewelSize = boardDimensions.width / settings.cols;
    jewelSpritesFilename = 'images/jewels' + jewelSize + '.png';
    preloader.load(jewelSpritesFilename, loadedImages);

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
