import board from 'board';
import display from 'display';

function redrawDisplay (jewels) {
    display.redraw(jewels, function () {
        // do nothing for now
    });
}

function getBoard () {
    board.getBoard(redrawDisplay);
}

function initializeDisplay () {
    display.initialize(getBoard);
}

export function run () {
    board.initialize(initializeDisplay);
}
