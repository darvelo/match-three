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
