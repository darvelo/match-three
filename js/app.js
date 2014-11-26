import board from 'board';
import game from 'game';
import type from 'util/type';

var App = {
    board: board,
    game: game,
    type: type,
    start: function () {
        game.setup();
        game.showScreen('splash-screen');
        console.log('App started!');
    },
};

export default App;
