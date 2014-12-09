import board from 'board';
import display from 'display';

var cursor = {};

function setCursor (x, y, selected) {
    cursor = { x, y, selected };
}

function selectJewel (x, y) {
    if (arguments.length === 0) {
        selectJewel(cursor.x, cursor.y);
        return;
    }

    if (!cursor.selected) {
        setCursor(x, y, true);
        return;
    }

    var dx = Math.abs(x - cursor.x);
    var dy = Math.abs(y - cursor.y);
    var dist = dx + dy;

    switch (dist) {
    case 0:
        setCursor(x, y, false);
        break;
    case 1:
        // swap jewels
        break;
    default:
        setCursor(x, y);
        break;
    }
}

function redrawDisplay (jewels) {
    display.redraw(jewels, function () {
        // do nothing for now
    });
}

function getBoard () {
    board.getBoard(redrawDisplay);
}

function initializeDisplay () {
    display.initialize(function () {
        setCursor(0, 0, false);
        getBoard();
    });
}

export function run () {
    board.initialize(initializeDisplay);
}
