import settings from 'settings';
import { bind } from 'util/dom';

var worker;
var messageCount;
var callbacks;

function post (command, data, callback) {
    callbacks[messageCount] = callback;

    worker.postMessage({
        id: messageCount,
        command: command,
        data: data
    });

    messageCount++;
}

// function messageHandler (event) {
function messageHandler ({ data: message }) {
    if (callbacks[message.id]) {
        callbacks[message.id](message.data);
        delete callbacks[message.id];
    }
}

export function getJewel (x, y, callback) {
    post('getJewel', {x, y}, callback);
}

export function getBoard (callback) {
    post('getBoard', null, callback);
}

export function print () {
    post('print', null, jewels => console.log(jewels));
}

export function swap (x1, y1, x2, y2, callback) {
    post('swap', {x1, y1, x2, y2}, callback);
}

export function initialize (callback) {
    messageCount = 0;
    callbacks = [];
    worker = new Worker('/scripts/workers/board.js');

    bind(worker, 'message', messageHandler);
    bind(worker, 'error', err => console.log('worker error:', err));

    post('initialize', settings, callback);
}

