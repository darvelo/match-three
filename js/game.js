import { $, $$ } from 'util/dom';

export function showScreen (id) {
    var activeScreen = $$('#game .screen.active')[0],
        screen = $(id);

    if (activeScreen) {
        activeScreen.classList.remove('active');
    }

    screen.classList.add('active');
}
