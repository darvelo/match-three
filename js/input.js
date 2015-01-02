import { $$, bind } from 'util/dom';
import settings from 'settings';

var inputHandlers;

var keys = {
    72: 'KEY_LEFT',
    75: 'KEY_UP',
    76: 'KEY_RIGHT',
    74: 'KEY_DOWN',
    37: 'KEY_LEFT',
    38: 'KEY_UP',
    39: 'KEY_RIGHT',
    40: 'KEY_DOWN',
    13: 'KEY_ENTER',
    32: 'KEY_SPACE',
};

// bind a handler function to a game action
export function bindAction (action, handler) {
    if (!inputHandlers[action]) {
        inputHandlers[action] = [];
    }

    inputHandlers[action].push(handler);
}

// trigger a game action
function trigger (action, ...args) {
    var handlers = inputHandlers[action] || [];
    var i;

    for (i = 0; i < handlers.length; ++i) {
        // catch errors to keep the process going
        try { handlers[i](...args); }
        catch (e) {}
    }
}

function handleClick (e, control, click) {
    var action = settings.controls[control];

    if (!action) {
        return;
    }

    var board = $$('#game-screen .game-board')[0];
    var rect = board.getBoundingClientRect();

    // click position relative to board
    var relX = click.clientX - rect.left;
    var relY = click.clientY - rect.top;

    // jewel coordinates
    var jewelX = Math.floor(relX / rect.width * settings.cols);
    var jewelY = Math.floor(relY / rect.height * settings.rows);

    // trigger functions bound to action
    trigger(action, jewelX, jewelY);

    e.preventDefault();
}

export function initialize () {
    var board = $$('#game-screen .game-board')[0];

    inputHandlers = {};

    bind(board, 'mousedown', e => handleClick(e, 'CLICK', e));
    bind(board, 'touchstart', e => handleClick(e, 'TOUCH', e.targetTouches[0]));

    bind(document, 'keydown', e => {
        var keyName = keys[e.keyCode];

        if (keyName && settings.controls[keyName]) {
            e.preventDefault();
            trigger(settings.controls[keyName]);
        }
    });
}
