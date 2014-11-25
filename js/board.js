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
