import board from 'board';
import game from 'game';
import is from 'util/is';

var App = {
    board: board,
    game: game,
    is: is,
    start: function () {
        game.setup();
        game.showScreen('splash-screen');
        console.log('App started!');
    },
};

export default App;
