import settings from 'settings';
import type from 'util/type';

var jewels;
var cols;
var rows;
var baseScore;
var numJewelTypes;

function randomJewel () {
    return Math.floor(Math.random() * numJewelTypes);
}

function getJewel (x, y) {
    if (x < 0 || x > cols-1 || y < 0 || y > rows-1) {
        return -1;
    }

    return jewels[x][y];
}

function fillBoard () {
    var type;
    jewels = [];

    for (var x = 0; x < cols; ++x) {
        jewels[x] = [];

        for (var y = 0; y < rows; ++y) {
            type = randomJewel();
            // disallow chains to form while setting up the board
            while ((type === getJewel(x-1, y) &&
                    type === getJewel(x-2, y)) ||
                    type === getJewel(x, y-1) &&
                    type === getJewel(x, y-2)) {
                type = randomJewel();
            }

            jewels[x][y] = type;
        }
    }
}

// returns the number of jewels in the longest chain that includes (x, y)
function checkChain (x, y) {
    var type = getJewel(x, y);
    var up, down, left, right;
    up = down = left = right = 0;

    // look up
    while (type === getJewel(x, y - up - 1)) {
        up++;
    }

    // look down
    while (type === getJewel(x, y + down + 1)) {
        down++;
    }

    // look left
    while (type === getJewel(x - left - 1, y)) {
        left++;
    }

    // look right
    while (type === getJewel(x + right + 1, y)) {
        right++;
    }

    return Math.max(left + 1 + right, up + 1 + down);
}

function isAdjacent (x1, y1, x2, y2) {
    var dx = Math.abs(x1 - x2);
    var dy = Math.abs(y1 - y2);
    return (dx + dy === 1);
}

// returns true if (x1, y1) can be swapped with (x2, y2) to form a new match
export function canSwap (x1, y1, x2, y2) {
    var type1 = getJewel(x1, y1);
    var type2 = getJewel(x2, y2);
    var chain;

    if (!isAdjacent(x1, y1, x2, y2)) {
        return false;
    }

    // temporarily swap jewels to check for chains
    jewels[x1][y1] = type2;
    jewels[x2][y2] = type1;

    chain = checkChain(x1, x2) > 2 || checkChain(x2, y2) > 2;

    // swap back
    jewels[x1][y1] = type1;
    jewels[x2][y2] = type2;

    return chain;
}

// returns a two-dimensional map of chain lengths
function getChains () {
    var chains = [];

    for (var x = 0; x < cols; ++x) {
        chains[x] = [];

        for (var y = 0; y < rows; ++y) {
            chains[x][y] = checkChain(x, y);
        }
    }

    return chains;
}

function check (events) {
    var chains = getChains();
    var hadChains = false;
    var removed = [], moved = [], gaps = [];
    var x, y;

    // points awarded for this swap
    var score = 0;

    // remove chains and move existing jewels down (let them fall)
    for (x = 0; x < cols; ++x) {
        gaps[x] = 0;

        for (y = rows - 1; y >= 0; --y) {
            if (chains[x][y] > 2) {
                hadChains = true;
                gaps[x]++;

                removed.push({
                    x: x,
                    y: y,
                    type: getJewel(x, y),
                });

                // add points to score
                // double the multiplier for every extra jewel in the chain
                score += baseScore * Math.pow(2, (chains[x][y] - 3));
            } else if (gaps[x]) {
                moved.push({
                    fromX: x,
                    fromY: y,
                    toX: x,
                    toY: y + gaps[x],
                    type: getJewel(x, y),
                });

                jewels[x][y + gaps[x]] = getJewel(x, y);
            }
        }
    }

    // create new jewels to drop down from out of view
    for (x = 0; x < cols; ++x) {
        for (y = gaps[x] - 1; y >= 0; --y) {
            jewels[x][y] = randomJewel();

            moved.push({
                fromX: x,
                fromY: y - gaps[x],
                toX: x,
                toY: y,
                type: jewels[x][y],
            });
        }
    }

    events = events || [];

    // recursively check for chains created by new jewels
    if (hadChains) {
        events.push({
            type: 'remove',
            data: removed,
        }, {
            type: 'score',
            data: score,
        }, {
            type: 'move',
            data: moved,
        });

        return check(events);
    } else {
        return events;
    }
}

export function print () {
    var str = '\n';
    for (var y = 0; y < rows; ++y) {
        for (var x = 0; x < cols; ++x) {
            str += getJewel(x, y) + ' ';
        }

        str += '\n';
    }

    console.log(str);
}

export function initialize (callback) {
    cols = settings.cols;
    rows = settings.rows;
    baseScore = settings.baseScore;
    numJewelTypes = settings.numJewelTypes;
    fillBoard();

    if (type(callback, 'Function')) {
        callback();
    }
}
