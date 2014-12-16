var board = (function () {
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

    // returns the number of jewels in the longest chain that includes (x, y)
    function checkChain (x, y) {
        var type = getJewel(x, y);
        var up, down, left, right;
        up = down = left = right = 0;

        // look up
        while (type === getJewel(x, y - up - 1)) {
            up++;
        }

        // look down
        while (type === getJewel(x, y + down + 1)) {
            down++;
        }

        // look left
        while (type === getJewel(x - left - 1, y)) {
            left++;
        }

        // look right
        while (type === getJewel(x + right + 1, y)) {
            right++;
        }

        return Math.max(left + 1 + right, up + 1 + down);
    }

    function isAdjacent (x1, y1, x2, y2) {
        var dx = Math.abs(x1 - x2);
        var dy = Math.abs(y1 - y2);
        return (dx + dy === 1);
    }

    // returns true if (x1, y1) can be swapped with (x2, y2) to form a new match
    function canSwap (x1, y1, x2, y2) {
        var type1 = getJewel(x1, y1);
        var type2 = getJewel(x2, y2);
        var chain;

        if (!isAdjacent(x1, y1, x2, y2)) {
            return false;
        }

        // temporarily swap jewels to check for chains
        jewels[x1][y1] = type2;
        jewels[x2][y2] = type1;

        chain = checkChain(x2, y2) > 2 || checkChain(x1, y1) > 2;

        // swap back
        jewels[x1][y1] = type1;
        jewels[x2][y2] = type2;

        return chain;
    }

    // returns true if (x, y) is a valid position and if
    // the jewel at (x, y) can be swapped with a neighbor
    function canJewelMove (x, y) {
        return (
                (x > 0 && canSwap(x, y, x-1, y)) ||
                (x < cols-1 && canSwap(x, y, x+1, y)) ||

                (y > 0 && canSwap(x, y, x, y-1)) ||
                (y < rows-1 && canSwap(x, y, x, y+1))
            );
    }

    // returns true if at least one match can be made
    function hasMoves () {
        for (var x = 0; x < cols; ++x) {
            for (var y = 0; y < rows; ++y) {
                if (canJewelMove(x, y)) {
                    return true;
                }
            }
        }

        return false;
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

        if (!hasMoves()) {
            fillBoard();
        }
    }

    // returns a two-dimensional map of chain lengths
    function getChains () {
        var chains = [];

        for (var x = 0; x < cols; ++x) {
            chains[x] = [];

            for (var y = 0; y < rows; ++y) {
                chains[x][y] = checkChain(x, y);
            }
        }

        return chains;
    }

    // create a copy of the jewel board
    function getBoard () {
        var copy = [];
        var x;

        for (x = 0; x < cols; ++x) {
            copy[x] = jewels[x].slice();
        }

        return copy;
    }

    function check (events) {
        var chains = getChains();
        var hadChains = false;
        var removed = [], moved = [], gaps = [];
        var x, y;

        // points awarded for this swap
        var score = 0;

        // remove chains and move existing jewels down (let them fall)
        for (x = 0; x < cols; ++x) {
            gaps[x] = 0;

            for (y = rows - 1; y >= 0; --y) {
                if (chains[x][y] > 2) {
                    hadChains = true;
                    gaps[x]++;

                    removed.push({
                        x: x,
                        y: y,
                        type: getJewel(x, y),
                    });

                    // add points to score
                    // double the multiplier for every extra jewel in the chain
                    score += baseScore * Math.pow(2, (chains[x][y] - 3));
                } else if (gaps[x]) {
                    moved.push({
                        fromX: x,
                        fromY: y,
                        toX: x,
                        toY: y + gaps[x],
                        type: getJewel(x, y),
                    });

                    jewels[x][y + gaps[x]] = getJewel(x, y);
                }
            }
        }

        // create new jewels to drop down from out of view
        for (x = 0; x < cols; ++x) {
            for (y = gaps[x] - 1; y >= 0; --y) {
                jewels[x][y] = randomJewel();

                moved.push({
                    fromX: x,
                    fromY: y - gaps[x],
                    toX: x,
                    toY: y,
                    type: jewels[x][y],
                });
            }
        }

        events = events || [];

        // recursively check for chains created by new jewels
        if (hadChains) {
            events.push({
                type: 'remove',
                data: removed,
            }, {
                type: 'score',
                data: score,
            }, {
                type: 'move',
                data: moved,
            });

            if (!hasMoves()) {
                fillBoard();

                events.push({
                    type: 'refill',
                    data: getBoard(),
                });
            }

            return check(events);
        } else {
            return events;
        }
    }

    // if possible, swaps (x1, y2) and (x2, y2) and
    // calls the callback function with a list of board events
    function swap (x1, y1, x2, y2, callback) {
        var events = [];
        var tmp;

        var initialSwapEvent = {
            type: 'move',
            data: [{
                type: getJewel(x1, y1),
                fromX: x1,
                fromY: y1,
                toX: x2,
                toY: y2,
            }, {
                type: getJewel(x2, y2),
                fromX: x2,
                fromY: y2,
                toX: x1,
                toY: y1,
            }],
        };

        var swapBackEvent = {
            type: 'move',
            data: [{
                type: getJewel(x2, y2),
                fromX: x1,
                fromY: y1,
                toX: x2,
                toY: y2,
            }, {
                type: getJewel(x1, y1),
                fromX: x2,
                fromY: y2,
                toX: x1,
                toY: y1,
            }],
        };

        if (isAdjacent(x1, y1, x2, y2)) {
            events.push(initialSwapEvent);
        }

        if (canSwap(x1, y1, x2, y2)) {
            // swap the jewels
            tmp = getJewel(x1, y1);
            jewels[x1][y1] = getJewel(x2, y2);
            jewels[x2][y2] = tmp;

            // check the board and get a list of events
            events = events.concat(check());
        } else {
            events.push(swapBackEvent, { type: 'badswap' });
        }

        if (typeof callback === 'function') {
            callback(events);
        }
    }

    function print () {
        var str = '\n';
        for (var y = 0; y < rows; ++y) {
            for (var x = 0; x < cols; ++x) {
                str += getJewel(x, y) + ' ';
            }

            str += '\n';
        }

        return str;
    }

    function initialize (settings, callback) {
        cols = settings.cols;
        rows = settings.rows;
        baseScore = settings.baseScore;
        numJewelTypes = settings.numJewelTypes;
        fillBoard();

        if (typeof callback === 'function') {
            callback();
        }
    }

    return {
        initialize: initialize,
        swap: swap,
        getBoard: getBoard,
        print: print,
        getJewel: getJewel,
    };
})();
