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
        data: JSON.parse(JSON.stringify(data)),
    });

    messageCount++;
}

function messageHandler (event) {
    var message = event.data;

    if (callbacks[message.id]) {
        callbacks[message.id](message.data);
        delete callbacks[message.id];
    }
}

export function getJewel (x, y, callback) {
    post('getJewel', {
        x: x,
        y: y,
    }, callback);
}

export function getBoard (callback) {
    post('getBoard', null, callback);
}

export function print () {
    post('print', null, function (jewels) {
        console.log(jewels);
    });
}

export function swap (x1, y1, x2, y2, callback) {
    post('swap', {
        x1: x1,
        y1: y1,
        x2: x2,
        y2: y2
    }, callback);
}

export function initialize (callback) {
    messageCount = 0;
    callbacks = [];
    worker = new Worker('/scripts/workers/board.js');
    bind(worker, 'message', messageHandler);
    bind(worker, 'error', function (err) {
        console.log('worker error:', err);
    });
    post('initialize', settings, callback);
}

