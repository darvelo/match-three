import { $$ } from 'util/dom';
import settings from 'settings';
import preloader from 'util/loader';
import loadedImages from 'images';
import rAF from 'util/rAF';
import cssTransform from 'util/css-transform';

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
        startTime: previousCycle,
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

    // reset animation list
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
    if (!previousCycle) {
        previousCycle = time;
    }

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
    ctx.clearRect(x * jewelSize, y * jewelSize, jewelSize, jewelSize);
}

function drawJewel (type, x, y, scale, rotation) {
    var image = loadedImages[jewelSpritesFilename];

    ctx.save();

    if (typeof scale !== 'undefined' && scale > 0) {
        ctx.beginPath();
        ctx.translate((x + 0.5) * jewelSize, (y + 0.5) * jewelSize);
        ctx.scale(scale, scale);
        if (rotation) {
            ctx.rotate(rotation);
        }

        ctx.translate(-(x + 0.5) * jewelSize, -(y + 0.5) * jewelSize);
    }

    ctx.drawImage(image,
        type * jewelSize, 0, jewelSize, jewelSize,
        x * jewelSize, y * jewelSize,
        jewelSize, jewelSize
    );

    ctx.restore();
}

export function moveJewels (movedJewels, callback) {
    var n = movedJewels.length;
    var oldCursor = cursor;

    cursor = null;

    movedJewels.forEach(e => {
        var x = e.fromX;
        var y = e.fromY;
        var dx = e.toX - e.fromX;
        var dy = e.toY - e.fromY;
        var dist = Math.abs(dx) + Math.abs(dy);

        var anim = {
            before(pos) {
                pos = Math.sin(pos * Math.PI / 2);
                clearJewel(x + dx * pos, y + dy * pos);
            },

            render(pos) {
                pos = Math.sin(pos * Math.PI / 2);
                drawJewel(
                    e.type,
                    x + dx * pos, y + dy * pos
                );
            },

            done() {
                if (--n === 0) {
                    cursor = oldCursor;
                    callback();
                }
            },
        };

        addAnimation(200 * dist, anim);
    });
}

export function removeJewels (removedJewels, callback) {
    var n = removedJewels.length;

    removedJewels.forEach(e => {
        var anim = {
            before() {
                clearJewel(e.x, e.y);
            },

            render(pos) {
                ctx.save();
                ctx.globalAlpha = 1 - pos;
                drawJewel(
                    e.type, e.x, e.y,
                    1 - pos, pos * Math.PI * 2
                );
                ctx.restore();
            },

            done() {
                if (--n === 0) {
                    callback();
                }
            }
        };

        addAnimation(200, anim);
    });
}

export function refill (newJewels, callback) {
    var lastJewel = 0;

    var anim = {
        render(pos) {
            var thisJewel = Math.floor(pos * cols * rows);

            for (let i = lastJewel; i < thisJewel; ++i) {
                let x = i % cols;
                let y = Math.floor(i / cols);
                clearJewel(x, y);
                drawJewel(newJewels[x][y], x, y);
            }

            lastJewel = thisJewel;
            cssTransform(canvas, 'rotateX(' + (360 * pos) + 'deg)');
        },

        done() {
            cssTransform(canvas, '');
            callback();
        }
    };

    addAnimation(1000, anim);
}

function explodePieces (pieces, pos, delta) {
    var piece;

    for (piece of pieces) {
        // apply gravity
        piece.vel.y += 50 * delta;
        piece.pos.y += piece.vel.y * delta;
        piece.pos.x += piece.vel.x * delta;

        if (piece.pos.x < 0 || piece.pos.x > cols) {
            piece.pos.x = Math.max(0, piece.pos.x);
            piece.pos.x = Math.min(cols, piece.pos.x);
            piece.vel.x *= -1;
        }

        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        ctx.translate(piece.pos.x * jewelSize, piece.pos.y * jewelSize);
        ctx.rotate(piece.rot * pos * Math.PI * 4);
        ctx.translate(-piece.pos.x * jewelSize, -piece.pos.y * jewelSize);
        drawJewel(piece.type,
            piece.pos.x - 0.5,
            piece.pos.y - 0.5
        );
        ctx.restore();
    }
}

function explode (callback) {
    var pieces = [];
    var x, y;

    for (x = 0; x < cols; ++x) {
        for (y = 0; y < rows; ++y) {
            pieces.push({
                type: jewels[x][y],

                pos: {
                    x: x + 0.5,
                    y: y + 0.5,
                },

                vel: {
                    x: (Math.random() - 0.5) * 20,
                    y: -Math.random() * 10,
                },

                rot: (Math.random() - 0.5) * 3,
            });
        }
    }

    addAnimation(2000, {
        before()  {
            ctx.clearRect(0,0,canvas.width,canvas.height);
        },
        render(pos, delta) {
            explodePieces(pieces, pos, delta);
        },
        done: callback,
    });
}

export function gameOver (callback) {
    var anim = {
        render(pos) {
            canvas.style.left = 0.2 * pos * (Math.random() - 0.5) + 'em';
            canvas.style.top  = 0.2 * pos * (Math.random() - 0.5) + 'em';
        },

        done() {
            canvas.style.left = '0';
            canvas.style.top  = '0';
            explode(callback);
        },
    };

    addAnimation(1000, anim);
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
    ctx.lineWidth = lineWidthPercent * jewelSize;
    ctx.strokeStyle = 'rgba(250,250,150,' + (0.5 + 0.5 * t2)  +')';
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

export function levelUp (callback) {
    var anim = {
        before(pos) {
            var j = Math.floor(pos * rows * 2);
            var x, y;

            for (y = 0, x = j; y < rows; ++y, --x) {
                // boundary check
                if (x >= 0 && x < cols) {
                    clearJewel(x, y);
                    drawJewel(jewels[x][y], x, y);
                }
            }
        },

        render(pos) {
            var j = Math.floor(pos * rows * 2);
            var x, y;

            ctx.save();
            ctx.globalCompositeOperation = 'lighter';

            for (y = 0, x = j; y < rows; ++y, --x) {
                // boundary check
                if (x >= 0 && x < cols) {
                    drawJewel(jewels[x][y], x, y);
                }
            }

            ctx.restore();
        },

        done: callback,
    };

    addAnimation(1000, anim);
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

    rAF(cycle);
}

export function initialize (callback) {
    if (firstRun) {
        setup();
        firstRun = false;
    }

    callback();
}
