import board from 'board';
import display from 'display';

export function run () {
    board.initialize(function () {
        display.initialize(function () {
            // start the game
        });
    });
}
