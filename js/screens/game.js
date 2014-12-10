import board from 'board';
import display from 'display';

var cursor = {};

function setCursor (x = 0, y = 0, selected = false) {
    cursor = { x, y, selected };
}

function selectJewel (x = cursor.x, y = cursor.y) {
    if (!cursor.selected) {
        setCursor(x, y, true);
        return;
    }

    var dx = Math.abs(x - cursor.x);
    var dy = Math.abs(y - cursor.y);
    var dist = dx + dy;

    switch (dist) {
    case 0:
        // deselect the selected jewel
        setCursor(x, y, false);
        break;
    case 1:
        // selected an adjacent jewel: swap them
        board.swap(cursor.x, cursor.y, x, y, playBoardEvents);
        setCursor(x, y, false);
        break;
    default:
        // selected a different jewel
        setCursor(x, y, true);
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
