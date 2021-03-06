import { $, $$, bind } from 'util/dom';
import splashScreen from 'screens/splash';
import gameScreen from 'screens/game';
import mainMenu from 'screens/main-menu';

var screens = {
    'splash-screen': splashScreen,
    'game-screen': gameScreen,
    'main-menu': mainMenu,
};

export function showScreen (id, ...args) {
    var activeScreen = $$('#game .screen.active')[0];
    var screen = $(id);

    if (activeScreen) {
        activeScreen.classList.remove('active');
    }

    screens[id].run(...args);
    screen.classList.add('active');
}

export function setup () {
    bind(document, 'touchmove', e => e.preventDefault());

    // hide the address bar on Android devices
    if (/Android/.test(navigator.userAgent)) {
        $$('html')[0].style.height = '200%';
        setTimeout(() => window.scrollTo(0,1));
    }
}
