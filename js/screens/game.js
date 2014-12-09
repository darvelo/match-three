import board from 'board';
import display from 'display';

var cursor = {};

function setCursor (x, y, selected) {
    cursor = { x, y, selected };
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
