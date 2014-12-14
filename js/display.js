import { $$ } from 'util/dom';
import settings from 'settings';
import preloader from 'util/loader';
import loadedImages from 'images';
import rAF from 'util/rAF';
import now from 'util/now';

var boardElement;
var boardDimensions;

var canvas = document.createElement('canvas');
export var ctx = canvas.getContext('2d');

// previous animation frame time
var previousCycle;
var animations = [];

var { cols, rows } = settings;
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

function addAnimation (runTime, funcs) {
    var anim = {
        runTime,
        funcs,
        startTime: now(),
        pos: 0,
    };

    animations.push(anim);
}

function renderAnimations (time, lastTime) {
    // copy list
    var anims = animations.slice(0);

    // call before() function
    for (let anim of anims) {
        if (anim.funcs.before) {
            anim.funcs.before(anim.pos);
        }

        anim.lastPos = anim.pos;
        let animTime = (lastTime - anim.startTime);
        anim.pos = animTime / anim.runTime;
        // clamp animation position between 0 and 1
        anim.pos = Math.max(0, Math.min(1, anim.pos));
    }

    // rest animation list
    animations = [];

    // render after all before() calls to prevent any interference with rendering
    for (let anim of anims) {
        anim.funcs.render(anim.pos, anim.pos - anim.lastPos);

        if (anim.pos === 1) {
            if (anim.funcs.done) {
                anim.funcs.done();
            }
        } else {
            animations.push(anim);
        }
    }
}

function cycle (time) {
    renderCursor(time);
    renderAnimations(time, previousCycle);
    previousCycle = time;
    rAF(cycle);
}

function createBackground () {
    var bg = document.createElement('canvas');
    var bgCtx = bg.getContext('2d');
    var x, y;

    bg.classList.add('board-bg');
    bg.width = boardDimensions.width;
    bg.height = boardDimensions.height;

    bgCtx.fillStyle = 'rgba(255,235,255,0.15)';

    for (x = 0; x < cols; ++x) {
        for (y = 0; y < rows; ++y) {
            if ((x+y) % 2) {
                bgCtx.fillRect(
                    x * jewelSize, y * jewelSize,
                    jewelSize, jewelSize
                );
            }
        }
    }

    return bg;
}

function clearJewel (x, y) {
    ctx.clearRect(x, y, 1, 1);
}

function drawJewel (type, x, y) {
    var image = loadedImages[jewelSpritesFilename];

    ctx.drawImage(image,
                  type * jewelSize, 0, jewelSize, jewelSize,
                  x, y, 1, 1
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

function renderCursor (time) {
    if (!cursor) {
        return;
    }

    var { x, y } = cursor;
    var lineWidthPercent = 0.05;
    var t1 = (Math.sin(time / 200) + 1) / 2;
    var t2 = (Math.sin(time / 400) + 1) / 2;

    clearCursor();

    // draw the jewel lighter
    if (cursor.selected) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.globalAlpha = 0.8 * t1;
        drawJewel(jewels[x][y], x, y);
        ctx.restore();
    }

    // draw the cursor
    ctx.save();
    ctx.lineWidth = lineWidthPercent;
    ctx.strokeStyle = 'rgba(250,250,150,' + (0.5 + 0.5 * t2)  +')';
    ctx.strokeRect(
        x + lineWidthPercent, y + lineWidthPercent,
        1 - 2 * lineWidthPercent, 1 - 2 * lineWidthPercent
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
}

export function redraw (newJewels, callback) {
    var x, y;
    jewels = newJewels;

    preloader.one(jewelSpritesFilename, () => {
        ctx.clearRect(0, 0, cols, rows);

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

    // scale canvas coordinates to the size of one jewel.
    // makes it easier to manipulate jewels in drawing and animations.
    ctx.scale(jewelSize, jewelSize);

    boardElement.appendChild(createBackground());
    boardElement.appendChild(canvas);

    previousCycle = now();
    rAF(cycle);
}

export function initialize (callback) {
    if (firstRun) {
        setup();
        firstRun = false;
    }

    callback();
}
