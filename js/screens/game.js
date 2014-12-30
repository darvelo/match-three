import board from 'board';
import display from 'display';
import settings from 'settings';
import input from 'input';
import { $$ } from 'util/dom';

var firstRun = true;
var cursor = {};
var gameState;

function setCursor (x = 0, y = 0, selected = false) {
    cursor = { x, y, selected };
    display.setCursor(cursor);
}

function redrawDisplay (jewels) {
    return new Promise(resolve => {
        display.redraw(jewels, resolve);
    });
}

function getBoard () {
    return new Promise(resolve => {
        board.getBoard(resolve);
    });
}

function redrawBoard () {
    return getBoard().then(redrawDisplay);
}

function advanceLevel () {
    gameState.level++;
    updateGameInfo();
    gameState.startTime = Date.now();
    gameState.endTime = settings.baseLevelTimer *
        Math.pow(gameState.level, -0.05 * gameState.level);

    setLevelTimer(true);
    display.levelUp();
}

function addScore (points) {
    var nextLevelAt = Math.pow(
        settings.baseLevelScore,
        Math.pow(settings.baseLevelExp, gameState.level - 1)
    );

    gameState.score += points;

    if (gameState.score >= nextLevelAt) {
        advanceLevel();
    }

    updateGameInfo();
}

function playBoardEvents (events = []) {
    if (events.length === 0) {
        redrawBoard();
        return;
    }

    var boardEvent = events.shift();
    var next = function () {
        playBoardEvents(events);
    };

    switch (boardEvent.type) {
    case 'move':
        display.moveJewels(boardEvent.data, next);
        break;
    case 'remove':
        display.removeJewels(boardEvent.data, next);
        break;
    case 'refill':
        display.refill(boardEvent.data, next);
        break;
    case 'score':
        addScore(boardEvent.data);
        next();
        break;
    default:
        next();
        break;
    }
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

function moveCursor (x, y) {
    if (cursor.selected) {
        x += cursor.x;
        y += cursor.y;

        if (x >= 0 && x < settings.cols &&
            y >= 0 && y < settings.rows) {
            selectJewel(x, y);
        }
    } else {
        x = (cursor.x + x + settings.cols) % settings.cols;
        y = (cursor.y + y + settings.rows) % settings.rows;
        setCursor(x, y, false);
    }
}

function moveUp () {
    moveCursor(0, -1);
}

function moveDown () {
    moveCursor(0, 1);
}

function moveLeft () {
    moveCursor(-1, 0);
}

function moveRight () {
    moveCursor(1, 0);
}

function setupInputs () {
    input.initialize();
    input.bindAction('selectJewel', selectJewel);
    input.bindAction('moveUp', moveUp);
    input.bindAction('moveDown', moveDown);
    input.bindAction('moveLeft', moveLeft);
    input.bindAction('moveRight', moveRight);
}

function initializeDisplay () {
    display.initialize(() => {
        redrawBoard().then(() => {
            advanceLevel();
        });
    });
}

function updateGameInfo () {
    var gameScreen = $$('.game-screen')[0];
    var scoreEl = $$('.score span', gameScreen)[0];
    var levelEl = $$('.level span', gameScreen)[0];

    scoreEl.innerHTML = gameState.score;
    levelEl.innerHTML = gameState.level;
}

function setLevelTimer (reset) {
    if (gameState.timer) {
        clearTimeout(gameState.timer);
        gameState.timer = 0;
    }

    if (reset) {
        gameState.startTime = Date.now();
        gameState.endTime =
            settings.baseLevelTimer *
            Math.pow(gameState.level,
                    -0.05 * gameState.level);
    }

    var delta = gameState.startTime + gameState.endTime - Date.now();
    var percent = (delta / gameState.endTime) * 100;
    var progress = $$('#game-screen .time .indicator')[0];

    if (delta < 0) {
        gameOver();
    } else {
        progress.style.width = percent + '%';
        gameState.timer = setTimeout(setLevelTimer, 30);
    }
}

function startGame () {
    gameState = {
        level: 0,
        score: 0,
        timer: 0,     // setTimeout reference
        startTime: 0, // time at the start of the level
        endTime: 0,   // time to game over
    };

    cursor = {
        x: 0,
        y: 0,
        selected: false,
    };

    updateGameInfo();

    board.initialize(initializeDisplay);
}

export function run () {
    if (firstRun) {
        setupInputs();
        firstRun = false;
    }

    startGame();
}
