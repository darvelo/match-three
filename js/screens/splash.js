import { $, $$, bind } from 'util/dom';
import { getLoadProgress } from 'util/loader';

var firstRun = true;
var splashScreen = $('splash-screen');
var progressBar = $$('.loader', splashScreen)[0];
var continueButton = $$('.continue', splashScreen)[0];

// avoid circular reference when requiring game module
var game;

function goToMainMenu () {
    continueButton.style.display = 'block';
    bind('#splash-screen', 'click', function () {
        game.showScreen('main-menu');
    });
}

function checkLoadProgress () {
    var percent = (getLoadProgress() * 100)|0;

    progressBar.setAttribute('value', percent);

    if (percent >= 100) {
        goToMainMenu();
    } else {
        setTimeout(checkLoadProgress, 30);
    }
}

function setup () {
    if (getLoadProgress() === 0) {
        progressBar.setAttribute('value', 100);
        goToMainMenu();
        return;
    }

    checkLoadProgress();
}

export function run () {
    if (firstRun) {
        game = require('game');
        firstRun = false;
        setup();
    }
}
