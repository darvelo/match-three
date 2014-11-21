import { $, $$ } from 'util/dom';
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
