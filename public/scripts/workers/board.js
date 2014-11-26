/*global board:true*/
/*global importScripts:true*/
/*global postMessage:true*/
importScripts('/scripts/workers/imports/board.js');

addEventListener('message', function (event) {
    var message = event.data;

    function callback (data) {
        postMessage({
            id: message.id,
            data: data,
            jewels: board.getBoard(),
        });
    }

    switch (message.command) {
        case 'initialize':
            board.initialize(message.data, callback);
            break;
        case 'swap':
            board.swap(
                message.data.x1,
                message.data.y1,
                message.data.x2,
                message.data.y2,
                callback
            );
            break;
        case 'getJewel':
            callback(board.getJewel(message.data.x, message.data.y));
            break;
        case 'getBoard':
            callback(board.getBoard());
            break;
        case 'print':
            callback(board.print());
            break;
    }
});
