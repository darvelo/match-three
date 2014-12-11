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
// the cursor position as sent from the game-screen module
var cursor;
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

function clearJewel (x, y) {
    ctx.clearRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
}

function drawJewel (type, x, y) {
    var image = loadedImages[jewelSpritesFilename];

    ctx.drawImage(image,
                  type * jewelSize, 0, jewelSize, jewelSize,
                  x * jewelSize, y * jewelSize, jewelSize, jewelSize
                 );
}

export function moveJewels (movedJewels, callback) {
    for (let mover of movedJewels) {
        clearJewel(mover.fromX, mover.fromY);
        drawJewel(mover.type, mover.toX, mover.toY);
    }

    callback();
}

export function removeJewels (removedJewels, callback) {
    for (let removed of removedJewels) {
        clearJewel(removed.x, removed.y);
    }

    callback();
}

export function refill (...args) {
    redraw(...args);
}

function clearCursor () {
    if (!cursor) {
        return;
    }

    var { x, y } = cursor;
    clearJewel(x, y);
    drawJewel(jewels[x][y], x, y);
}

function renderCursor () {
    if (!cursor) {
        return;
    }

    var { x, y } = cursor;
    var lineWidthPercent = 0.05;

    clearCursor();

    if (!cursor.selected) {
        return;
    }

    // draw the jewel lighter
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.8;
    drawJewel(jewels[x][y], x, y);
    ctx.restore();

    // draw the cursor
    ctx.save();
    ctx.lineWidth = lineWidthPercent * jewelSize;
    ctx.strokeStyle = 'rgba(250,250,150,0.8)';
    ctx.strokeRect(
        (x + lineWidthPercent) * jewelSize, (y + lineWidthPercent) * jewelSize,
        (1 - lineWidthPercent * 2) * jewelSize, (1 - lineWidthPercent * 2) * jewelSize
    );
    ctx.restore();
}

export function setCursor ({ x, y, selected }) {
    clearCursor();

    if (arguments.length > 0) {
        cursor = { x, y, selected };
    } else {
        cursor = null;
    }

    renderCursor();
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

        renderCursor();
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
