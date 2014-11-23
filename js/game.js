import { $, $$, bind } from 'util/dom';
import splashScreen from 'screens/splash';
import mainMenu from 'screens/main-menu';

var screens = {
    'splash-screen': splashScreen,
    'main-menu': mainMenu,
};

export function showScreen (id) {
    var activeScreen = $$('#game .screen.active')[0],
        screen = $(id);

    if (activeScreen) {
        activeScreen.classList.remove('active');
    }

    screens[id].run();
    screen.classList.add('active');
}

export function setup () {
    bind(document, 'touchmove', function (e) {
        e.preventDefault();
    });

    // hide the address bar on Android devices
    if (/Android/.test(navigator.userAgent)) {
        $$('html')[0].style.height = '200%';
        setTimeout(function () { window.scrollTo(0,1); }, 0);
    }
}
