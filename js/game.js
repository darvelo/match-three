import { $, $$, bind } from 'util/dom';
import splashScreen from 'screens/splash';
import gameScreen from 'screens/game';
import mainMenu from 'screens/main-menu';
import settings from 'settings';
import preload from 'util/loader';

var screens = {
    'splash-screen': splashScreen,
    'game-screen': gameScreen,
    'main-menu': mainMenu,
};

export function showScreen (id) {
    var activeScreen = $$('#game .screen.active')[0];
    var screen = $(id);
    var args = [].slice.call(arguments, 1);

    if (activeScreen) {
        activeScreen.classList.remove('active');
    }

    screens[id].run.apply(screens[id], args);
    screen.classList.add('active');
}

function loadImages () {
    preload('images/jewels' + settings.jewelSize + '.png', settings.images);
}

export function setup () {
    bind(document, 'touchmove', function (e) {
        e.preventDefault();
    });

    loadImages();

    // hide the address bar on Android devices
    if (/Android/.test(navigator.userAgent)) {
        $$('html')[0].style.height = '200%';
        setTimeout(function () { window.scrollTo(0,1); }, 0);
    }
}
